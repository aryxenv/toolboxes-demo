# Presenter notes — Toolboxes in Foundry

A crisp, customer-facing story: **tools are the bottleneck → a toolbox fixes it →
here's the value, live.** 8 slides, ~10–12 minutes with the demo.

Controls: **← / →** change slides · **Space** cycles the highlighted card on a
slide · **swipe** on touch.

---

## Before you present (live demo setup)

Slide 7 streams **two real Foundry agents** — one consuming a real toolbox MCP
endpoint, one with no tools. When the backend is offline it falls back to
realistic **demo data** (labeled `Demo data`), so the deck always works. To run
it fully live:

1. `cp server/.env.example server/.env` and fill in your Foundry project,
   model, toolbox endpoint, and Azure OpenAI endpoint. Run `az login`.
2. Create the shared toolbox once: `cd server && uv run python create_toolbox.py`,
   then paste the printed endpoint into `FOUNDRY_TOOLBOX_ENDPOINT`.
3. Start the backend: `cd server && uv sync && uv run fastapi dev`.
4. Start the deck: `npm run dev`.

No secrets are committed (`server/.env` is git-ignored; auth is
`DefaultAzureCredential`). **If the backend is offline** (e.g. the published
deck), slide 7 auto-runs on realistic **demo data** — the header shows a
`Demo data` pill. **When the server is online it's fully live** — real
streaming, evals, and tokens — and real errors surface as-is (no fallback).
Live numbers are that run's real values, not published benchmarks — say so.

---

## Slide 1 — Toolboxes in Foundry (hero)

**The point:** Build your tools once; consume them from any agent.

- Open with the one-liner: a toolbox is a _curated, reusable bundle of tools_
  you manage in Foundry and expose through **one governed MCP endpoint**.
- Point at the visual: three tools → one endpoint → many agents.
- Note it's **Generally Available** today.

**Transition:** "But why does this matter? Look at how tools work without it."

## Slide 2 — Every agent re-wires every tool (the problem)

**The point:** Tool integration — not the model — is the bottleneck.

- Space through the four failure modes: duplicated work, credential sprawl,
  inconsistent governance, no visibility.
- Use the concrete example: one onboarding agent needs five tools — five tool
  types, five auth models, five owning teams. Now multiply by every agent.

**Transition:** "Foundry Toolbox is designed to remove exactly this friction."

## Slide 3 — What is a toolbox? (concept)

**The point:** One reusable bundle, one consistent interface.

- Read the definition line.
- Space through the four pillars: **Discover · Build · Consume · Govern**.
  Emphasize Build + Consume are the two that remove friction immediately (marked
  Available).

**Transition:** "Let's see Build and Consume."

## Slide 4 — Build once. Consume anywhere. (how it works)

**The point:** Curate + configure auth once; connect any agent with one endpoint.

- **Build** (default view): tool types — built-in (Web Search, Code Interpreter,
  File Search, Azure AI Search) + protocols (MCP, A2A, OpenAPI). Auth is central:
  OAuth passthrough + Entra managed identity — agents never hold credentials.
- **Consume** (press Space / click): one MCP endpoint; connect once and discover
  every tool; promote a new default version and consumers get it for free.

**Transition:** "And you're not locked into Foundry agents to consume it."

## Slide 5 — Foundry-homed, not Foundry-bound (no lock-in)

**The point:** Governed in Foundry, consumed anywhere that speaks MCP.

- Left: created and governed in Foundry (tools, connections, credentials once).
- Right: any runtime — Microsoft Agent Framework, LangGraph, your own code,
  GitHub Copilot, Claude Code, MCP-enabled IDEs.

**Transition:** "Here's where it pays off for a real team."

## Slide 6 — One toolbox, three agents (use case)

**The point:** The clearest win — reuse across teams.

- Space through the three consumers: Support Triage, Field Sales, Docs Q&A — all
  consume the _same_ `product-support-toolbox`.
- Contrast the two cards: **without** a toolbox, 3 agents × 3 tools = nine
  integrations to build, secure, and keep from drifting. **With** one, configure
  three tools once → one endpoint → central auth, consistent governance,
  versioned upgrades everyone inherits.

**Transition:** "Let's prove it live."

## Slide 7 — Fewer tokens, same answer (live demo)

**The point:** Same tools, same answer — tool search makes the toolbox agent far
cheaper in tokens.

**Demo script:**

1. Click a suggestion (or type your own). Both agents stream at once and **both
   ground their answer** in the same tools — the answers come out essentially
   the same.
2. The story is in the header badges:
   - **Tokens:** the **Agent + Toolbox** side drops sharply. Tool search loads
     only the tool the task needs; the **Agent + Tools** side carries every
     tool's schema in context on every turn.
   - **Time (TTFT):** comparable — the toolbox side is a touch slower for the
     routing hop.
   - **Eval %:** essentially equal (Relevance + Coherence first, then
     Groundedness / Similarity / Retrieval) — quality doesn't regress.
3. Land it: same answer, a fraction of the tokens — and it's the reusable,
   governed one. As you add tools to a toolbox, tool search keeps that cost flat.
4. Try a second question (data-retention, SSO) to show it holds up.

**Note:** Tool search is in preview; toolboxes are GA.

**Transition:** "That efficiency compounds across every agent that reuses it."

## Slide 8 — Ship agents, not plumbing (recap + get started)

**The point:** Reuse, central auth, governance-ready, no lock-in, versioning,
faster delivery.

- Close on the value grid, then the entry points: Foundry portal (Build → Tools),
  VS Code Foundry Toolkit, or the azd CLI. Offer the docs/blog links.

---

## Sources (official Microsoft)

- Toolboxes are GA — Azure Update: https://azure.microsoft.com/en-us/updates?id=563481
- Introducing Toolboxes in Foundry (blog, narrative/problem): https://devblogs.microsoft.com/foundry/introducing-toolboxes-in-foundry/
- Agent tools overview — what a toolbox is: https://learn.microsoft.com/azure/foundry/agents/concepts/tool-catalog#types-of-tools
- Create, test & deploy a toolbox: https://learn.microsoft.com/azure/foundry/agents/how-to/tools/toolbox
- Tool search (preview) — why token costs grow with every tool: https://learn.microsoft.com/azure/foundry/agents/how-to/tools/tool-search
- Agent Framework — consume a toolbox over MCP: https://learn.microsoft.com/agent-framework/agents/providers/microsoft-foundry#toolboxes
- MCP tools with agents: https://learn.microsoft.com/agent-framework/agents/tools/local-mcp-tools
- Azure AI Evaluation SDK (eval metrics): https://learn.microsoft.com/azure/foundry-classic/how-to/develop/evaluate-sdk#built-in-evaluators
- RAG evaluators (groundedness / retrieval / similarity): https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/rag-evaluators

**Accuracy note:** No performance metrics are claimed on the slides. Demo eval
and token values are produced live by the Azure AI Evaluation SDK and the agent
runs — present them as this run's real numbers, not official benchmarks.
