import { SERVER_URL } from "@/lib/api";
import type { AgentKind, FullScores, QuickScores, TokenUsage } from "./types";

/** Fast check for whether the demo backend is reachable. Used to decide
 * between the real live path and the offline simulation. */
export async function checkServerOnline(timeoutMs = 1500): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${SERVER_URL}/health`, {
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

interface StreamHandlers {
  onChunk: (text: string) => void;
  onContext: (context: string) => void;
  onUsage: (usage: TokenUsage) => void;
  onError: (message: string) => void;
  onDone: () => void;
}

/** Parse a Server-Sent Events stream from the agent query endpoints.
 * Events: default `message` (text delta), `context`, `usage` (`in:out`),
 * `error`; the stream ends on `data: [DONE]`. */
async function consumeSSE(
  response: Response,
  handlers: StreamHandlers,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    handlers.onError("No response stream from server.");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const raw of events) {
      let eventType = "message";
      const dataLines: string[] = [];

      for (const line of raw.split("\n")) {
        if (line.startsWith("event: ")) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          dataLines.push(line.slice(6));
        }
      }

      const data = dataLines.join("\n");
      if (data === "[DONE]") {
        handlers.onDone();
        return;
      }

      if (eventType === "usage") {
        const [input, output] = data.split(":");
        handlers.onUsage({
          inputTokens: Number(input) || 0,
          outputTokens: Number(output) || 0,
        });
      } else if (eventType === "context") {
        handlers.onContext(data);
      } else if (eventType === "error") {
        handlers.onError(data || "The agent returned an error.");
      } else if (data) {
        handlers.onChunk(data);
      }
    }
  }

  handlers.onDone();
}

/** Start streaming one agent's answer. Returns an AbortController to cancel. */
export function streamAgent(
  kind: AgentKind,
  query: string,
  handlers: StreamHandlers,
): AbortController {
  const controller = new AbortController();
  const path = kind === "toolbox" ? "toolbox-agent" : "plain-agent";

  (async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/query/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      if (!response.ok) {
        handlers.onError(`Server responded ${response.status}.`);
        handlers.onDone();
        return;
      }

      await consumeSSE(response, handlers);
    } catch (error) {
      if (controller.signal.aborted) return;
      handlers.onError(
        error instanceof TypeError
          ? "Server unavailable. Start it with `uv run fastapi dev`."
          : error instanceof Error
            ? error.message
            : "Request failed.",
      );
      handlers.onDone();
    }
  })();

  return controller;
}

export async function evaluateQuick(
  query: string,
  response: string,
  signal?: AbortSignal,
): Promise<QuickScores> {
  const res = await fetch(`${SERVER_URL}/api/evaluate/quick`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, response }),
    signal,
  });
  if (!res.ok) throw new Error(`Eval responded ${res.status}`);
  return (await res.json()) as QuickScores;
}

export interface FullEvalRequest {
  query: string;
  toolboxResponse: string;
  plainResponse: string;
  toolboxContext: string;
  plainContext: string;
}

export interface FullEvalResult {
  toolbox: FullScores;
  plain: FullScores;
}

export async function evaluateFull(
  request: FullEvalRequest,
  signal?: AbortSignal,
): Promise<FullEvalResult> {
  const res = await fetch(`${SERVER_URL}/api/evaluate/full`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: request.query,
      toolbox_response: request.toolboxResponse,
      plain_response: request.plainResponse,
      toolbox_context: request.toolboxContext,
      plain_context: request.plainContext,
    }),
    signal,
  });
  if (!res.ok) throw new Error(`Full eval responded ${res.status}`);
  return (await res.json()) as FullEvalResult;
}
