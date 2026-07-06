import { Bot, Boxes, Globe, Plug, Search } from "lucide-react";
import type { SlideProps } from "@/components/slides/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SlideFrame } from "@/components/ui/slide-frame";

const bundledTools = [
  { icon: Search, label: "Azure AI Search" },
  { icon: Globe, label: "Web Search" },
  { icon: Plug, label: "MCP action" },
];

const agents = ["Support agent", "Sales agent", "Docs agent"];

export function ToolboxesIntro(_props: SlideProps) {
  return (
    <SlideFrame eyebrow="Foundry · GA" title="Toolboxes in Foundry.">
      <div className="grid grid-cols-1 gap-8 lg:min-h-full lg:grid-cols-[1.05fr_0.95fr] lg:content-center lg:gap-12">
        <div className="flex min-w-0 flex-col justify-center gap-5">
          <p className="text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl lg:text-4xl">
            Build your tools once. Consume them from{" "}
            <span className="text-primary">any agent</span>.
          </p>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            A toolbox is a curated, reusable bundle of tools you manage in
            Foundry and expose through a single, governed MCP endpoint, so
            agents connect once instead of re-wiring every tool.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Curate once</Badge>
            <Badge variant="outline">One MCP endpoint</Badge>
            <Badge variant="outline">Any agent runtime</Badge>
          </div>
        </div>

        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2">
            <Boxes aria-hidden="true" className="h-5 w-5 text-primary" />
            <p className="font-semibold tracking-[-0.01em]">
              product-support-toolbox
            </p>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-3">
            <div className="rounded-lg border-2 border-primary/50 bg-primary/5 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                <Boxes aria-hidden="true" className="h-3.5 w-3.5" />
                Toolbox
              </p>
              <div className="grid grid-cols-3 gap-2">
                {bundledTools.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2 rounded-md border border-border bg-muted/50 p-3 text-center"
                  >
                    <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                    <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <svg
                viewBox="0 0 2 20"
                preserveAspectRatio="none"
                className="mb-1 h-4 w-0.5"
                aria-hidden="true"
              >
                <path
                  className="arch-flow-line"
                  d="M1 0 V20"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                />
              </svg>
              <span className="text-[11px] font-semibold text-primary">
                one MCP endpoint
              </span>
              <svg
                viewBox="0 0 300 24"
                preserveAspectRatio="none"
                className="h-6 w-full"
                aria-hidden="true"
              >
                <path
                  d="M50 5 H250"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="1.5"
                />
                <g fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5">
                  <path className="arch-flow-line" d="M50 5 V24" />
                  <path className="arch-flow-line" d="M150 5 V24" />
                  <path className="arch-flow-line" d="M250 5 V24" />
                </g>
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {agents.map((agent) => (
                <div
                  key={agent}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-border p-2 text-center"
                >
                  <Bot
                    aria-hidden="true"
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {agent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </SlideFrame>
  );
}
