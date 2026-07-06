import {
  Bot,
  Code,
  Cpu,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import type { SlideProps } from "@/components/slides/types";
import { Card } from "@/components/ui/card";
import { SlideFrame } from "@/components/ui/slide-frame";

const groups = [
  {
    label: "Custom agents",
    runtimes: [
      { icon: Cpu, name: "Microsoft Agent Framework" },
      { icon: Workflow, name: "LangGraph" },
      { icon: Code, name: "Your own code" },
    ],
  },
  {
    label: "Coding agents",
    runtimes: [
      { icon: Sparkles, name: "GitHub Copilot" },
      { icon: Bot, name: "Claude Code" },
      { icon: Puzzle, name: "MCP-enabled IDEs" },
    ],
  },
];

export function BuildOnceConsumeAnywhere(_props: SlideProps) {
  return (
    <SlideFrame eyebrow="No lock-in" title="Foundry-homed, not Foundry-bound.">
      <div className="grid grid-cols-1 gap-6 lg:min-h-full lg:grid-cols-[0.8fr_1.2fr] lg:content-center lg:gap-10">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="flex flex-col gap-3 border-2 border-primary p-5">
            <ShieldCheck aria-hidden="true" className="h-6 w-6 text-primary" />
            <p className="font-semibold tracking-[-0.01em]">
              Created & governed in Foundry
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Teams configure tools, connections, and credentials once. The
              consumption surface stays open.
            </p>
          </Card>
          <p className="text-sm leading-6 text-muted-foreground">
            Any runtime that speaks MCP can consume a toolbox, so you reuse your
            tool investments without duplicating configuration or governance.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {group.label}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {group.runtimes.map((runtime) => {
                  const Icon = runtime.icon;
                  return (
                    <Card
                      key={runtime.name}
                      className="flex items-center gap-3 p-4 sm:flex-col sm:items-start sm:gap-3"
                    >
                      <Icon
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-primary"
                      />
                      <span className="text-sm font-medium leading-tight">
                        {runtime.name}
                      </span>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
