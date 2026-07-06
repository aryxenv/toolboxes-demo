"""Streaming query endpoints for the live "Agent + Toolbox vs Agent" comparison.

Both endpoints return Server-Sent Events using FastAPI's native
``StreamingResponse`` (same wire format the client's ``consumeSSE`` parser
expects):

* ``data: <token>``               — a text delta
* ``event: context`` / ``data:``  — retrieved evidence (toolbox agent only)
* ``event: usage`` / ``data: i:o``— input:output token counts
* ``event: error`` / ``data:``    — a friendly failure message
* ``data: [DONE]``                — terminal
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ..utils.foundry_agents import (
    CONTEXT_SENTINEL,
    USAGE_SENTINEL,
    stream_agent,
)

router = APIRouter(prefix="/api/query", tags=["query"])

SSE_HEADERS = {"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1)


def _sse_event(data: str, event: str | None = None) -> str:
    lines = "".join(f"data: {line}\n" for line in data.split("\n"))
    prefix = f"event: {event}\n" if event else ""
    return f"{prefix}{lines}\n"


async def _sse_wrapper(
    generator: AsyncGenerator[str, None], request: Request
) -> AsyncGenerator[str, None]:
    try:
        async for chunk in generator:
            if await request.is_disconnected():
                break
            if chunk.startswith(USAGE_SENTINEL):
                yield _sse_event(chunk[len(USAGE_SENTINEL) :], event="usage")
            elif chunk.startswith(CONTEXT_SENTINEL):
                yield _sse_event(chunk[len(CONTEXT_SENTINEL) :], event="context")
            else:
                yield _sse_event(chunk)
    except Exception as exc:  # surface config/runtime errors in the panel
        yield _sse_event(str(exc), event="error")
    yield "data: [DONE]\n\n"


@router.post("/toolbox-agent")
async def query_toolbox_agent(body: QueryRequest, request: Request):
    """Agent that consumes the Foundry Toolbox over its MCP endpoint."""
    return StreamingResponse(
        _sse_wrapper(stream_agent(body.query, use_toolbox=True), request),
        media_type="text/event-stream",
        headers=SSE_HEADERS,
    )


@router.post("/plain-agent")
async def query_plain_agent(body: QueryRequest, request: Request):
    """Same tools wired directly on the agent — no toolbox, no tool search."""
    return StreamingResponse(
        _sse_wrapper(stream_agent(body.query, use_toolbox=False), request),
        media_type="text/event-stream",
        headers=SSE_HEADERS,
    )
