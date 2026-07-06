import {
  BookOpen,
  CircleCheck,
  Headset,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import type { SlideProps } from "@/components/slides/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SlideFrame } from "@/components/ui/slide-frame";
import { cn } from "@/lib/utils";

const agents = [
  {
    icon: Headset,
    team: "Support team",
    name: "Support Triage agent",
    detail: "Resolves tickets with grounded answers and opens tracking issues.",
  },
  {
    icon: TrendingUp,
    team: "Sales team",
    name: "Field Sales assistant",
    detail: "Answers product questions with the latest approved information.",
  },
  {
    icon: BookOpen,
    team: "Docs team",
    name: "Docs Q&A bot",
    detail: "Powers the documentation site's grounded assistant.",
  },
];

export function UseCaseOneToolboxManyAgents({
  cycleIndex,
  onSelectCycle,
}: SlideProps) {
  return (
    <SlideFrame eyebrow="Use case" title="One toolbox, three agents.">
      <div className="grid grid-cols-1 gap-6 lg:min-h-full lg:grid-cols-[1fr_1fr] lg:content-center lg:gap-10">
        <div className="flex min-w-0 flex-col gap-3">
          {agents.map((agent, index) => {
            const isActive = index === cycleIndex;
            const Icon = agent.icon;
            return (
              <Card
                key={agent.name}
                onClick={() => onSelectCycle(index)}
                className={cn(
                  "flex cursor-pointer items-start gap-3 border-2 p-4 transition-colors duration-300",
                  isActive ? "border-primary" : "border-border",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold tracking-[-0.01em]">
                      {agent.name}
                    </p>
                    <Badge variant={isActive ? "default" : "muted"}>
                      {agent.team}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {agent.detail}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    consumes · product-support-toolbox
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex min-w-0 flex-col justify-center gap-3">
          <Card className="flex flex-col gap-2 border-2 border-border p-5">
            <div className="flex items-center gap-2">
              <TriangleAlert
                aria-hidden="true"
                className="h-5 w-5 text-muted-foreground"
              />
              <p className="font-semibold tracking-[-0.01em]">
                Without a toolbox
              </p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Each team re-wires AI Search, web search, and the action tool, and
              manages its own auth. Three agents × three tools ={" "}
              <span className="font-semibold text-foreground">
                nine integrations
              </span>{" "}
              to build, secure, and keep from drifting apart.
            </p>
          </Card>

          <Card className="flex flex-col gap-2 border-2 border-primary p-5">
            <div className="flex items-center gap-2">
              <CircleCheck
                aria-hidden="true"
                className="h-5 w-5 text-primary"
              />
              <p className="font-semibold tracking-[-0.01em]">With a toolbox</p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Configure the three tools{" "}
              <span className="font-semibold text-foreground">once</span>. All
              three agents connect to one endpoint, with central auth,
              consistent governance, and versioned upgrades everyone inherits
              for free.
            </p>
          </Card>
        </div>
      </div>
    </SlideFrame>
  );
}
