import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FullScores, QuickScores } from "../types";

interface EvalBadgeProps {
  quick: QuickScores | null;
  full: FullScores | null;
  isEvaluating: boolean;
  isFullEvaluating: boolean;
}

function computeOverall(
  quick: QuickScores | null,
  full: FullScores | null,
): number | null {
  const values: number[] = [];
  if (quick) values.push(quick.relevance, quick.coherence);
  if (full) values.push(full.groundedness, full.similarity, full.retrieval);
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** Green "eval" pill with the overall score. Hovering shows the per-metric
 * breakdown (progressive: 2 metrics after quick eval, 5 after full eval). */
export function EvalBadge({
  quick,
  full,
  isEvaluating,
  isFullEvaluating,
}: EvalBadgeProps) {
  const overall = computeOverall(quick, full);

  if (overall === null) {
    if (isEvaluating) {
      return (
        <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          <span className="animate-pulse">evaluating…</span>
        </span>
      );
    }
    return null;
  }

  const breakdown = [
    quick ? `Relevance: ${quick.relevance}%` : null,
    quick ? `Coherence: ${quick.coherence}%` : null,
    full ? `Groundedness: ${full.groundedness}%` : null,
    full ? `Similarity: ${full.similarity}%` : null,
    full ? `Retrieval: ${full.retrieval}%` : null,
    !full ? "Groundedness / Similarity / Retrieval: pending…" : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <span
      title={`Foundry evaluations\n${breakdown}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
        "border-success/40 bg-success/15 text-success",
      )}
    >
      {overall}% eval
      {isFullEvaluating ? (
        <span className="animate-pulse">·</span>
      ) : (
        <Info aria-hidden="true" className="h-3 w-3 opacity-70" />
      )}
    </span>
  );
}
