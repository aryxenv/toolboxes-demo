import {
  ArrowRight,
  Gauge,
  KeyRound,
  Puzzle,
  RefreshCw,
  Repeat,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import type { SlideProps } from "@/components/slides/types";
import { Card } from "@/components/ui/card";
import { SlideFrame } from "@/components/ui/slide-frame";

const benefits = [
  {
    icon: Repeat,
    title: "Reuse",
    detail: "Curate once, reuse across every agent.",
  },
  {
    icon: KeyRound,
    title: "Central auth",
    detail: "OAuth passthrough + Entra identity.",
  },
  {
    icon: ShieldCheck,
    title: "Governance-ready",
    detail: "One place for controls & visibility.",
  },
  { icon: Puzzle, title: "No lock-in", detail: "Any MCP-compatible runtime." },
  {
    icon: RefreshCw,
    title: "Versioning",
    detail: "Upgrade without changing consumers.",
  },
  {
    icon: Gauge,
    title: "Fewer tokens",
    detail: "Tool search loads only the tools a task needs.",
  },
];

const links = [
  {
    label: "Foundry portal · Build → Tools",
    href: "https://ai.azure.com",
  },
  {
    label: "Create, test & deploy a toolbox (docs)",
    href: "https://learn.microsoft.com/azure/foundry/agents/how-to/tools/toolbox",
  },
  {
    label: "Introducing Toolboxes in Foundry (blog)",
    href: "https://devblogs.microsoft.com/foundry/introducing-toolboxes-in-foundry/",
  },
];

export function ValueAndGetStarted(_props: SlideProps) {
  return (
    <SlideFrame eyebrow="Recap & next steps" title="Ship agents, not plumbing.">
      <div className="grid grid-cols-1 gap-6 lg:min-h-full lg:grid-cols-[1.15fr_0.85fr] lg:content-center lg:gap-10">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card key={benefit.title} className="flex flex-col gap-2 p-4">
                <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                <p className="font-semibold tracking-[-0.01em]">
                  {benefit.title}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {benefit.detail}
                </p>
              </Card>
            );
          })}
        </div>

        <Card className="flex min-w-0 flex-col gap-3 border-2 border-primary p-5">
          <div className="flex items-center gap-2">
            <Rocket aria-hidden="true" className="h-5 w-5 text-primary" />
            <p className="font-semibold tracking-[-0.01em]">Get started</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Create a toolbox in the portal, VS Code Foundry Toolkit, or the azd
            CLI, then point any agent at the endpoint.
          </p>
          <div className="mt-1 flex flex-col gap-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                rel="noreferrer"
                target="_blank"
                className="group flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-muted"
              >
                <span className="min-w-0 truncate text-muted-foreground group-hover:text-foreground">
                  {link.label}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary"
                />
              </a>
            ))}
          </div>
        </Card>
      </div>
    </SlideFrame>
  );
}
