"""Two Microsoft Agent Framework agents for the live comparison:

* **toolbox agent** — consumes a Foundry Toolbox over its MCP endpoint
  (`MCPStreamableHTTPTool`). The toolbox's **tool search** routes to the tool a
  task needs, so only that tool's schema enters the model context.
* **tools agent** — the same tools wired **directly** on the agent (no toolbox,
  no tool search), so every tool's schema stays in context on every turn.

Both ground their answers equally; the comparison surfaces the token cost of
carrying all tool definitions vs. loading only what's needed. Reference docs:
* Toolbox over MCP from a chat client:
  https://learn.microsoft.com/agent-framework/agents/providers/microsoft-foundry#toolboxes
* Tool search (why token costs grow with every tool):
  https://learn.microsoft.com/azure/foundry/agents/how-to/tools/tool-search
* Toolbox endpoints & token scope:
  https://learn.microsoft.com/azure/foundry/agents/how-to/tools/toolbox

Auth is `DefaultAzureCredential` (az login / managed identity) — no keys.
Targets agent-framework / agent-framework-foundry 1.10.x.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

from azure.identity import DefaultAzureCredential, get_bearer_token_provider

from ..config import (
    AZURE_AI_SEARCH_CONNECTION_ID,
    AZURE_AI_SEARCH_INDEX,
    FOUNDRY_MODEL,
    FOUNDRY_PROJECT_ENDPOINT,
    FOUNDRY_TOOLBOX_ENDPOINT,
    TOOLBOX_SCOPE,
    require,
)

# Sentinels the SSE layer converts into `event: context` / `event: usage`.
USAGE_SENTINEL = "__USAGE__"
CONTEXT_SENTINEL = "__CONTEXT__"

# Both agents share the same grounded instructions — the difference is how the
# tools are attached, not what the agent is asked to do.
SUPPORT_SYSTEM_PROMPT = (
    "You are the Contoso Product Support agent. Use the tools available to you "
    "to ground every answer in retrieved evidence: search the internal "
    "knowledge base first, then approved public docs, and take action when the "
    "user asks. Cite the sources you used inline, and state any action you took. "
    "Be concise, specific, and accurate. If evidence is missing, say so."
)


def _build_chat_client():
    """Foundry chat client bound to the project's model deployment."""
    from agent_framework.foundry import FoundryChatClient

    require("FOUNDRY_PROJECT_ENDPOINT", FOUNDRY_PROJECT_ENDPOINT)
    return FoundryChatClient(
        project_endpoint=FOUNDRY_PROJECT_ENDPOINT,
        model=FOUNDRY_MODEL,
        credential=DefaultAzureCredential(),
    )


def _build_toolbox_tool():
    """MCP tool pointed at the Foundry toolbox consumer endpoint.

    The client authenticates to the toolbox with an Entra ID bearer token; the
    toolbox handles per-tool (upstream) auth server-side via its connections.
    """
    from agent_framework import MCPStreamableHTTPTool

    require("FOUNDRY_TOOLBOX_ENDPOINT", FOUNDRY_TOOLBOX_ENDPOINT)
    token_provider = get_bearer_token_provider(DefaultAzureCredential(), TOOLBOX_SCOPE)

    def _headers(_context: dict) -> dict[str, str]:
        return {"Authorization": f"Bearer {token_provider()}"}

    return MCPStreamableHTTPTool(
        name="product_support_toolbox",
        url=FOUNDRY_TOOLBOX_ENDPOINT,
        header_provider=_headers,
    )


def _build_direct_tools(client) -> list:
    """Attach the same tools directly on the agent — the "old way", without a
    toolbox or tool search. Every tool's schema stays in the model context on
    every turn, which is what drives the higher token usage in the comparison.
    Web Search is zero-config; Azure AI Search is included when configured.
    """
    tools = [client.get_web_search_tool()]
    if AZURE_AI_SEARCH_CONNECTION_ID and AZURE_AI_SEARCH_INDEX:
        tools.append(
            client.get_azure_ai_search_tool(
                index_connection_id=AZURE_AI_SEARCH_CONNECTION_ID,
                index_name=AZURE_AI_SEARCH_INDEX,
            )
        )
    return tools


def _extract_usage(final: object) -> tuple[int, int]:
    """Best-effort (input, output) token counts from an agent run response."""
    usage = getattr(final, "usage_details", None) or getattr(final, "usage", None)
    if usage is not None:
        for in_attr, out_attr in (
            ("input_token_count", "output_token_count"),
            ("input_tokens", "output_tokens"),
            ("prompt_tokens", "completion_tokens"),
        ):
            in_val = getattr(usage, in_attr, None)
            out_val = getattr(usage, out_attr, None)
            if in_val is not None and out_val is not None:
                return int(in_val), int(out_val)
    return 0, 0


def _capture_context(update: object, buffer: list[str]) -> None:
    """Collect retrieved evidence from tool/function results in a stream update.
    Used as the ``context`` for groundedness/retrieval evaluation. Both agents
    have tools, so both produce context — evals come out close, as expected.
    """
    for item in getattr(update, "contents", None) or []:
        name = type(item).__name__.lower()
        if "functionresult" in name or "toolresult" in name or hasattr(item, "result"):
            value = getattr(item, "result", None)
            text = getattr(value, "text", None) or (
                str(value) if value is not None else None
            )
            if text:
                buffer.append(text)


async def stream_agent(query: str, use_toolbox: bool) -> AsyncGenerator[str, None]:
    """Stream one agent's answer, then emit context + usage sentinels.

    Yields raw text deltas as they arrive, then (optionally) a
    ``__CONTEXT__<retrieved evidence>`` chunk and a ``__USAGE__<in>:<out>`` chunk.
    """
    from agent_framework import Agent

    client = _build_chat_client()
    tools = [_build_toolbox_tool()] if use_toolbox else _build_direct_tools(client)
    name = "product-support-toolbox" if use_toolbox else "product-support-tools"

    context: list[str] = []
    async with Agent(
        client=client, name=name, instructions=SUPPORT_SYSTEM_PROMPT, tools=tools
    ) as agent:
        response_stream = agent.run(query, stream=True)
        async for update in response_stream:
            text = getattr(update, "text", None)
            if text:
                yield text
            _capture_context(update, context)
        final = await response_stream.get_final_response()

    input_tokens, output_tokens = _extract_usage(final)
    if not output_tokens:
        output_tokens = max(1, len((getattr(final, "text", "") or "")) // 4)

    joined = "\n\n---\n\n".join(context)[:8000]
    if joined:
        yield f"{CONTEXT_SENTINEL}{joined}"
    yield f"{USAGE_SENTINEL}{input_tokens}:{output_tokens}"
