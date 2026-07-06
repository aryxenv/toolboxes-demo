import type { FullScores, QuickScores } from "./types";

/** A scripted agent response used when the backend is offline, so the demo is
 * self-contained (e.g. the published static deck). Values are illustrative;
 * when the server is online, everything is real instead.
 *
 * Both sides have the same tools and ground their answers equally. The
 * comparison shows the effect of **tool search**: the toolbox agent loads only
 * the tool a task needs (far fewer tokens, a touch slower for the routing hop),
 * while the agent with tools wired directly carries every tool's schema in
 * context. Eval quality is essentially the same. */
export interface SimAgent {
  text: string;
  ttftMs: number;
  streamMs: number;
  inputTokens: number;
  outputTokens: number;
  context?: string;
  quick: QuickScores;
  full: FullScores;
}

export interface SimScenario {
  toolbox: SimAgent;
  plain: SimAgent;
}

const exportContext =
  "KB, Report export limits & scheduling: exports overlapping the nightly index rebuild (01:00–02:00 UTC) are throttled; chunked CSV recommended above 100k rows. v4.2 release notes: added scheduled-export window validation.";

const exportScenario: SimScenario = {
  toolbox: {
    text: "**Fix:** On the **Business** plan, report export fails when a scheduled export overlaps the nightly index rebuild (01:00–02:00 UTC).\n\n1. In **Admin → Exports**, move the schedule outside that window.\n2. For workspaces >100k rows, use **CSV (chunked)**.\n\nSource: *Internal KB, “Report export limits & scheduling”*.\n\n✅ Opened tracking issue **#4821**.",
    ttftMs: 1350,
    streamMs: 1500,
    inputTokens: 402,
    outputTokens: 208,
    context: exportContext,
    quick: { relevance: 94, coherence: 93 },
    full: { groundedness: 95, similarity: 100, retrieval: 93 },
  },
  plain: {
    text: "Looking into the failed **Business**-plan report export.\n\nThe internal KB shows exports are throttled when they overlap the nightly index rebuild (**01:00–02:00 UTC**).\n\n**Fix:**\n1. Reschedule the export outside 01:00–02:00 UTC (**Admin → Exports**).\n2. For large workspaces (>100k rows), switch to **CSV (chunked)**.\n\nSource: *Internal KB, “Report export limits & scheduling”* and the **v4.2 release notes**.\n\n✅ Opened tracking issue **#4821** and tagged the Reports team.",
    ttftMs: 1080,
    streamMs: 1600,
    inputTokens: 2740,
    outputTokens: 236,
    context: exportContext,
    quick: { relevance: 92, coherence: 92 },
    full: { groundedness: 93, similarity: 96, retrieval: 92 },
  },
};

const retentionContext =
  "KB, Data Retention Policy v3 (Jun 2026): default log retention increased to 180 days; deleted-workspace purge window extended to 30 days; automatic migration for existing workspaces.";

const retentionScenario: SimScenario = {
  toolbox: {
    text: "The data-retention policy changed on **2026-06-15**: default log retention **90 → 180 days**; deleted-workspace purge **7 → 30 days**.\n\nSource: *Internal KB, “Data Retention Policy v3”*.\n\nNo action needed, existing workspaces were migrated automatically.",
    ttftMs: 1300,
    streamMs: 1450,
    inputTokens: 384,
    outputTokens: 190,
    context: retentionContext,
    quick: { relevance: 93, coherence: 94 },
    full: { groundedness: 95, similarity: 100, retrieval: 92 },
  },
  plain: {
    text: "Here's what changed in the data-retention policy (effective **2026-06-15**):\n\n- Default log retention: **90 → 180 days**\n- Deleted-workspace purge window: **7 → 30 days**\n\nSource: *Internal KB, “Data Retention Policy v3”* (updated Jun 2026), also summarized in the **Trust Center**.\n\nExisting workspaces were migrated automatically, so no action is required.",
    ttftMs: 1050,
    streamMs: 1500,
    inputTokens: 2610,
    outputTokens: 214,
    context: retentionContext,
    quick: { relevance: 92, coherence: 93 },
    full: { groundedness: 93, similarity: 95, retrieval: 91 },
  },
};

const ssoContext =
  "KB, SSO login failures triage runbook: leading causes are IdP clock skew, expired/rotated SAML certificates, and SAML group-claim mismatches; includes step-by-step remediation.";

const ssoScenario: SimScenario = {
  toolbox: {
    text: "**Top 3 causes of failed SSO logins** (last 30 days):\n\n1. **Clock skew > 5 min** on the IdP, 41%\n2. **Stale SAML certificate** after rotation, 33%\n3. **Group-claim mismatch**, 18%\n\nRunbook: *Internal KB, “SSO login failures, triage runbook”*.\n\n✅ Linked the runbook to your ticket.",
    ttftMs: 1400,
    streamMs: 1600,
    inputTokens: 430,
    outputTokens: 224,
    context: ssoContext,
    quick: { relevance: 95, coherence: 92 },
    full: { groundedness: 94, similarity: 100, retrieval: 94 },
  },
  plain: {
    text: "Based on internal incident data, the **top 3 causes of failed SSO logins** in the last 30 days are:\n\n1. **Clock skew > 5 minutes** on the identity provider, 41%\n2. **Stale/rotated SAML certificate**, 33%\n3. **Group-claim mismatch** blocking role mapping, 18%\n\nRunbook: *Internal KB, “SSO login failures, triage runbook”*.\n\n✅ Linked the runbook to the ticket.",
    ttftMs: 1120,
    streamMs: 1650,
    inputTokens: 2880,
    outputTokens: 248,
    context: ssoContext,
    quick: { relevance: 93, coherence: 92 },
    full: { groundedness: 93, similarity: 96, retrieval: 93 },
  },
};

function defaultScenario(query: string): SimScenario {
  const q = query.length > 80 ? `${query.slice(0, 77)}…` : query;
  const context =
    "Retrieved evidence from the internal knowledge base and approved web sources relevant to the query.";
  return {
    toolbox: {
      text: `Grounded answer to **“${q}”** using the internal knowledge base and approved web sources, with sources cited inline. I can also take a follow-up action (open an issue, link a runbook).\n\nSource: *Internal KB* + *approved web docs*.`,
      ttftMs: 1300,
      streamMs: 1400,
      inputTokens: 390,
      outputTokens: 182,
      context,
      quick: { relevance: 92, coherence: 93 },
      full: { groundedness: 93, similarity: 100, retrieval: 92 },
    },
    plain: {
      text: `Here's a grounded answer to **“${q}”**, using the same internal knowledge base and approved web sources with citations, and I can take follow-up actions too.\n\nSource: *Internal KB* + *approved web docs*.`,
      ttftMs: 1050,
      streamMs: 1450,
      inputTokens: 2650,
      outputTokens: 204,
      context,
      quick: { relevance: 91, coherence: 92 },
      full: { groundedness: 92, similarity: 96, retrieval: 91 },
    },
  };
}

/** Pick a scripted scenario that matches the question. */
export function getScenario(query: string): SimScenario {
  const q = query.toLowerCase();
  if (q.includes("export")) return exportScenario;
  if (q.includes("retention") || q.includes("policy")) return retentionScenario;
  if (q.includes("sso") || q.includes("login")) return ssoScenario;
  return defaultScenario(query);
}
