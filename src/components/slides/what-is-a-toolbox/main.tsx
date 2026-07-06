import { Boxes, Plug, Search, ShieldCheck } from "lucide-react";
import type { SlideProps } from "@/components/slides/types";
import { Card } from "@/components/ui/card";
import { SlideFrame } from "@/components/ui/slide-frame";
import { cn } from "@/lib/utils";

const pillars = [
  {
    icon: Search,
    name: "Discover",
    detail: "Find the right approved tools instead of rebuilding them.",
    available: false,
  },
  {
    icon: Boxes,
    name: "Build",
    detail: "Curate tools into a named, reusable toolbox, managed in Foundry.",
    available: true,
  },
  {
    icon: Plug,
    name: "Consume",
    detail: "One MCP-compatible endpoint any agent runtime can call.",
    available: true,
  },
  {
    icon: ShieldCheck,
    name: "Govern",
    detail: "Central authentication and observability on every tool call.",
    available: false,
  },
];

export function WhatIsAToolbox({ cycleIndex, onSelectCycle }: SlideProps) {
  return (
    <SlideFrame eyebrow="Concept" title="What is a toolbox?">
      <div className="grid grid-cols-1 gap-6 lg:min-h-full lg:grid-cols-[0.85fr_1.15fr] lg:content-center lg:gap-10">
        <div className="flex min-w-0 flex-col justify-center gap-4">
          <p className="text-xl font-semibold leading-snug tracking-[-0.02em] sm:text-2xl">
            A reusable bundle of tools, managed in Foundry, that agents consume
            through one consistent interface.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Toolboxes cover the full tool lifecycle. Build and Consume remove
            the friction immediately, so you curate once, then connect any
            agent.
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          {pillars.map((pillar, index) => {
            const isActive = index === cycleIndex;
            const Icon = pillar.icon;
            return (
              <Card
                key={pillar.name}
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
                  {pillar.name}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {pillar.detail}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </SlideFrame>
  );
}
