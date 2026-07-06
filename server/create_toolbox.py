"""Create (or add a version to) the Product Support Toolbox in your Foundry
project — the "build once" half of the story. Configure the shared tools here a
single time; every agent then consumes them through one MCP endpoint.

Run it once, after `az login`, from the server directory:

    cd server
    uv run python create_toolbox.py

Configuration comes from ``server/.env`` (see ``.env.example``). Only tools
whose connection variables are set are included, so you can start with one or
two tools and add the rest later. On success it prints the consumer MCP
endpoint to paste into ``FOUNDRY_TOOLBOX_ENDPOINT``.

Reference (GA): https://learn.microsoft.com/azure/foundry/agents/how-to/tools/toolbox
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))

from azure.ai.projects import AIProjectClient  # noqa: E402
from azure.identity import DefaultAzureCredential  # noqa: E402

TOOLBOX_NAME = os.getenv("TOOLBOX_NAME", "product-support-toolbox")
PROJECT_ENDPOINT = (os.getenv("FOUNDRY_PROJECT_ENDPOINT") or "").strip().rstrip("/")


def build_tools() -> list[dict]:
    """Bundle the shared tools as REST tool specs. Each is optional based on the
    env vars set. Shapes follow the documented toolbox tool payloads."""
    tools: list[dict] = []

    # 1) Web search over approved public docs (built-in; no connection needed).
    tools.append({"type": "web_search", "description": "Search approved public docs."})

    # 2) Azure AI Search over the internal product knowledge base.
    search_conn = os.getenv("AZURE_AI_SEARCH_CONNECTION_ID")
    search_index = os.getenv("AZURE_AI_SEARCH_INDEX")
    if search_conn and search_index:
        tools.append(
            {
                "type": "azure_ai_search",
                "name": "product-kb",
                "description": "Search the internal product knowledge base.",
                "azure_ai_search": {
                    "indexes": [
                        {
                            "index_name": search_index,
                            "project_connection_id": search_conn,
                        }
                    ]
                },
            }
        )
    else:
        print(
            "… skipping Azure AI Search — set AZURE_AI_SEARCH_CONNECTION_ID "
            "and AZURE_AI_SEARCH_INDEX to include the internal knowledge base."
        )

    # 3) MCP action server (e.g. GitHub) so the agent can take action.
    mcp_url = os.getenv("TOOLBOX_MCP_SERVER_URL")
    mcp_conn = os.getenv("TOOLBOX_MCP_CONNECTION_ID")
    if mcp_url and mcp_conn:
        tools.append(
            {
                "type": "mcp",
                "server_label": os.getenv("TOOLBOX_MCP_SERVER_LABEL", "github"),
                "server_url": mcp_url,
                "require_approval": "never",
                "project_connection_id": mcp_conn,
            }
        )
    else:
        print(
            "… skipping MCP action tool — set TOOLBOX_MCP_SERVER_URL and "
            "TOOLBOX_MCP_CONNECTION_ID to let the agent take action."
        )

    # Intent-based tool routing across the whole bundle (connectionless).
    tools.append({"type": "toolbox_search_preview"})
    return tools


def main() -> None:
    if not PROJECT_ENDPOINT:
        raise SystemExit("Set FOUNDRY_PROJECT_ENDPOINT in server/.env first.")

    project = AIProjectClient(
        endpoint=PROJECT_ENDPOINT, credential=DefaultAzureCredential()
    )
    body = {
        "description": (
            "Shared Product Support toolbox: internal knowledge base (Azure AI "
            "Search), approved web search, and an MCP action server — reused by "
            "every support, sales, and docs agent, no per-agent re-wiring."
        ),
        "tools": build_tools(),
    }

    version = project.toolboxes.create_version(name=TOOLBOX_NAME, body=body)

    name = getattr(version, "name", TOOLBOX_NAME)
    number = getattr(version, "version", "1")
    print(f"\n✓ Created toolbox '{name}' version {number}")
    consumer_endpoint = (
        f"{PROJECT_ENDPOINT}/toolboxes/{TOOLBOX_NAME}/mcp?api-version=v1"
    )
    print("\nPaste this into server/.env as FOUNDRY_TOOLBOX_ENDPOINT:\n")
    print(f"  {consumer_endpoint}\n")


if __name__ == "__main__":
    main()
