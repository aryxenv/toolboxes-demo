import { Copy, Eye, KeyRound, ShieldCheck, TriangleAlert } from "lucide-react";
import type { SlideProps } from "@/components/slides/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SlideFrame } from "@/components/ui/slide-frame";
import { cn } from "@/lib/utils";

const problems = [
  {
    icon: Copy,
    title: "Duplicated work",
    detail: "Every team re-implements the same tools in every agent.",
  },
  {
    icon: KeyRound,
    title: "Credential sprawl",
    detail: "Each agent wires and stores its own auth for each tool.",
  },
  {
    icon: ShieldCheck,
    title: "Inconsistent governance",
    detail: "Controls and policy differ per agent, or are missing entirely.",
  },
  {
    icon: Eye,
    title: "No visibility",
    detail: "No single view of what tools exist or who is using them.",
  },
];

const onboardingTools = [
  "Create an Entra ID account",
  "Grant GitHub repo access",
  "Provision cloud resources",
  "Open Azure DevOps tasks",
  "Post a welcome in Teams",
];

export function ToolSprawlProblem({ cycleIndex, onSelectCycle }: SlideProps) {
  return (
    <SlideFrame eyebrow="The problem" title="Every agent re-wires every tool.">
      <div className="grid grid-cols-1 gap-6 lg:min-h-full lg:grid-cols-[1fr_0.9fr] lg:content-center lg:gap-10">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          {problems.map((problem, index) => {
            const isActive = index === cycleIndex;
            const Icon = problem.icon;
            return (
              <Card
                key={problem.title}
                onClick={() => onSelectCycle(index)}
                className={cn(
                  "cursor-pointer border-2 p-4 transition-colors duration-300",
                  isActive ? "border-primary" : "border-border",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <p className="mt-3 font-semibold tracking-[-0.01em]">
                  {problem.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {problem.detail}
                </p>
              </Card>
            );
          })}
        </div>

        <Card className="flex min-w-0 flex-col gap-4 p-6">
          <div className="flex items-center gap-2">
            <TriangleAlert
              aria-hidden="true"
              className="h-5 w-5 text-primary"
            />
            <p className="font-semibold tracking-[-0.01em]">
              One onboarding agent
            </p>
          </div>
          <div className="space-y-2">
            {onboardingTools.map((tool) => (
              <div
                key={tool}
                className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="min-w-0 truncate text-muted-foreground">
                  {tool}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="muted">5 tool types</Badge>
            <Badge variant="muted">5 auth models</Badge>
            <Badge variant="muted">5 owning teams</Badge>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Tool integration, not the model, becomes the bottleneck. Now
            multiply that across every agent you build.
          </p>
        </Card>
      </div>
    </SlideFrame>
  );
}
