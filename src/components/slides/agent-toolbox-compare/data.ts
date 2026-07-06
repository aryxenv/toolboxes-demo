import type { AgentKind } from "./types";

/** Display metadata for each side of the comparison. */
export interface AgentMeta {
  kind: AgentKind;
  name: string;
  tagline: string;
  tools: string[];
}

export const AGENTS: Record<AgentKind, AgentMeta> = {
  toolbox: {
    kind: "toolbox",
    name: "Agent + Toolbox",
    tagline: "One endpoint · tool search loads only what's needed",
    tools: ["Azure AI Search", "Web Search", "GitHub MCP"],
  },
  plain: {
    kind: "plain",
    name: "Agent + Tools",
    tagline: "Every tool wired directly · all schemas in context",
    tools: ["Azure AI Search", "Web Search", "GitHub MCP"],
  },
};

/** Suggested questions for the Product Support scenario. */
export const SUGGESTED_QUESTIONS: string[] = [
  "Fix report export on the Business plan and open a tracking issue.",
  "Top 3 causes of failed SSO logins, and link the runbook.",
];
