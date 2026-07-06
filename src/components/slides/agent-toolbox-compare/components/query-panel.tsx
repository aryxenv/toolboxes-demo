import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EvalBadge } from "./eval-badge";
import type { AgentMeta } from "../data";
import type { FullScores, QuickScores, StreamState } from "../types";

interface QueryPanelProps {
  meta: AgentMeta;
  state: StreamState;
  quick: QuickScores | null;
  full: FullScores | null;
  isEvaluating: boolean;
  isFullEvaluating: boolean;
  accent: boolean;
}

const MARKDOWN_CLASSES = cn(
  "space-y-3 text-sm leading-6 text-foreground",
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
  "[&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3",
  "[&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold",
  "[&_strong]:font-semibold [&_table]:w-full [&_th]:text-left [&_th]:font-semibold",
);

function TokenBadge({ state }: { state: StreamState }) {
  if (state.isStreaming || state.tokens === 0) return null;
  const hasUsage = state.inputTokens !== null && state.outputTokens !== null;
  const total = hasUsage
    ? state.inputTokens! + state.outputTokens!
    : state.tokens;
  const title = hasUsage
    ? `Input: ${state.inputTokens} · Output: ${state.outputTokens} tokens`
    : `Estimated ${state.tokens} tokens`;
  return (
    <span
      title={title}
      className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
    >
      {total} tk
    </span>
  );
}

export function QueryPanel({
  meta,
  state,
  quick,
  full,
  isEvaluating,
  isFullEvaluating,
  accent,
}: QueryPanelProps) {
  return (
    <Card
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-2",
        accent ? "border-primary" : "border-border",
      )}
    >
      <div className="flex flex-col gap-2 border-b border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold tracking-[-0.01em]">
              {meta.name}
            </span>
            <Badge variant={accent ? "default" : "muted"}>
              {accent ? "Tool search" : "Wired tools"}
            </Badge>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {state.ttft !== null ? (
              <span
                title="Time to first token"
                className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
              >
                {state.ttft.toFixed(1)}s
              </span>
            ) : null}
            <TokenBadge state={state} />
            <EvalBadge
              quick={quick}
              full={full}
              isEvaluating={isEvaluating}
              isFullEvaluating={isFullEvaluating}
            />
          </div>
        </div>
        <p className="truncate text-xs text-muted-foreground">{meta.tagline}</p>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
        {state.error ? (
          <p className="text-sm leading-6 text-destructive">{state.error}</p>
        ) : state.text ? (
          <div className={MARKDOWN_CLASSES}>
            <Markdown remarkPlugins={[remarkGfm]}>{state.text}</Markdown>
          </div>
        ) : state.isStreaming ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
            {accent ? "Calling tools…" : "Thinking…"}
          </div>
        ) : (
          <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground/60">
            Ask a question to compare
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        {meta.tools.length > 0 ? (
          <span className="truncate">{meta.tools.join(" · ")}</span>
        ) : (
          <span className="truncate">Model only</span>
        )}
      </div>
    </Card>
  );
}
