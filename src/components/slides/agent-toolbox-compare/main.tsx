import { useEffect } from "react";
import type { SlideProps } from "@/components/slides/types";
import { SlideFrame } from "@/components/ui/slide-frame";
import { QueryInput } from "./components/query-input";
import { QueryPanel } from "./components/query-panel";
import { AGENTS, SUGGESTED_QUESTIONS } from "./data";
import { useAgentCompare } from "./hooks";

export function AgentToolboxCompare({ isActive }: SlideProps) {
  const compare = useAgentCompare();
  const { isStreaming, stop } = compare;

  // Never keep streaming while the presenter has moved to another slide.
  useEffect(() => {
    if (!isActive && isStreaming) {
      stop();
    }
  }, [isActive, isStreaming, stop]);

  return (
    <SlideFrame eyebrow="Live demo" title="Fewer tokens, same answer.">
      <div className="flex min-h-0 flex-col gap-3 lg:flex-1">
        <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:flex-row">
          <div className="h-[52vh] min-h-0 lg:h-auto lg:flex-1">
            <QueryPanel
              meta={AGENTS.toolbox}
              state={compare.toolbox}
              quick={compare.toolboxEval}
              full={compare.toolboxFull}
              isEvaluating={compare.isToolboxEvaluating}
              isFullEvaluating={compare.isFullEvaluating}
              accent
            />
          </div>
          <div className="h-[52vh] min-h-0 lg:h-auto lg:flex-1">
            <QueryPanel
              meta={AGENTS.plain}
              state={compare.plain}
              quick={compare.plainEval}
              full={compare.plainFull}
              isEvaluating={compare.isPlainEvaluating}
              isFullEvaluating={compare.isFullEvaluating}
              accent={false}
            />
          </div>
        </div>

        <QueryInput
          onSend={compare.send}
          onStop={compare.stop}
          isStreaming={compare.isStreaming}
          suggestions={SUGGESTED_QUESTIONS}
        />
      </div>
    </SlideFrame>
  );
}
