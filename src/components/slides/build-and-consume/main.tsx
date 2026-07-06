import { Boxes, Gauge, KeyRound, Layers, Plug, RefreshCw } from "lucide-react";
import type { SlideProps } from "@/components/slides/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SlideFrame } from "@/components/ui/slide-frame";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Boxes,
    title: "Build",
    summary: "Curate tools + configure auth, once, in Foundry.",
  },
  {
    icon: Plug,
    title: "Consume",
    summary: "One MCP endpoint any agent connects to.",
  },
];

const builtInTools = [
  "Web Search",
  "Code Interpreter",
  "File Search",
  "Azure AI Search",
];
const protocols = ["MCP", "A2A", "OpenAPI"];

export function BuildAndConsume({ cycleIndex, onSelectCycle }: SlideProps) {
  const showConsume = cycleIndex === 1;

  return (
    <SlideFrame eyebrow="How it works" title="Build once. Consume anywhere.">
      <div className="flex flex-col gap-6 lg:min-h-full lg:flex-row lg:items-center lg:gap-10">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-[0.8]">
          {steps.map((step, index) => {
            const isActive = index === cycleIndex;
            const Icon = step.icon;
            return (
              <Card
                key={step.title}
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
                  <p className="font-semibold tracking-[-0.01em]">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {step.summary}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="flex min-w-0 flex-col gap-4 p-6 lg:flex-[1.2]">
          {showConsume ? (
            <>
              <p className="font-semibold tracking-[-0.01em]">
                One endpoint, any agent
              </p>
              <code className="block overflow-x-auto rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                {"{project}/toolboxes/{toolbox}/mcp?api-version=v1"}
              </code>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Plug
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  />
                  Connect once, and the agent discovers and invokes every tool
                  in the bundle dynamically.
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCw
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  />
                  Promote a new default version, and consumers get it without
                  changing a line of code.
                </li>
                <li className="flex items-start gap-2">
                  <Gauge
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  />
                  Tool search routes to the right tool, keeping fewer
                  definitions in context and a lower token cost.
                </li>
              </ul>
            </>
          ) : (
            <>
              <p className="font-semibold tracking-[-0.01em]">
                Curate tools, configure auth
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Built-in
                </p>
                <div className="flex flex-wrap gap-2">
                  {builtInTools.map((tool) => (
                    <Badge key={tool} variant="muted">
                      {tool}
                    </Badge>
                  ))}
                </div>
                <p className="pt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Protocols
                </p>
                <div className="flex flex-wrap gap-2">
                  {protocols.map((protocol) => (
                    <Badge key={protocol} variant="muted">
                      {protocol}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
                <KeyRound
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                />
                Auth is configured centrally with OAuth identity passthrough and
                Microsoft Entra managed identity. Agents never manage
                credentials.
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Layers aria-hidden="true" className="h-4 w-4" />
                Multiple tool types and auth models, spanned by one endpoint.
              </div>
            </>
          )}
        </Card>
      </div>
    </SlideFrame>
  );
}
