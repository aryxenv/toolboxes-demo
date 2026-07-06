# Demo backend

FastAPI backend for the deck's live "Agent + Toolbox vs Agent + Tools" comparison
(slide 7). CORS is open for local demo use; it is not production hardened.

## What it does

Two Microsoft Agent Framework agents answer the same question, streamed side by
side over Server-Sent Events:

- **Agent + Toolbox** consumes a Foundry Toolbox over its MCP endpoint, so tool
  search loads only the tool a task needs.
- **Agent + Tools** wires the same tools directly, so every tool schema stays in
  context on every turn.

Both are scored live with the Azure AI Evaluation SDK (relevance, coherence,
groundedness, similarity, retrieval) and report real token usage. The point of
the demo: same answer, far fewer tokens. Auth uses `DefaultAzureCredential`, so
no keys are stored.

## Endpoints

- `POST /api/query/toolbox-agent`, `POST /api/query/plain-agent`: SSE token
  streams (text deltas, then `event: context` and `event: usage`).
- `POST /api/evaluate/quick`: relevance and coherence.
- `POST /api/evaluate/full`: groundedness, similarity, retrieval.
- `GET /health`: health check the deck uses to decide live vs. demo data.

## Setup

1. Copy `.env.example` to `.env` and fill in your Foundry project, model,
   toolbox, and Azure OpenAI endpoints. Run `az login`.
2. Create the shared toolbox once (bundles Azure AI Search, Web Search, and a
   GitHub MCP tool), then paste the printed endpoint into
   `FOUNDRY_TOOLBOX_ENDPOINT`:

   ```pwsh
   uv sync
   uv run python create_toolbox.py
   ```

3. Start the backend:

   ```pwsh
   uv run fastapi dev
   ```

Available at http://localhost:8000; the deck picks it up automatically. If it is
not running, slide 7 falls back to labeled demo data. `.env` is git-ignored;
prerequisites are documented in `.env.example`.

## Structure

- `main.py`: FastAPI app and router registration.
- `src/router/`: `agents.py` (streaming), `evaluate.py` (scoring),
  `diagnostics.py` (health), `exports.py`.
- `src/utils/foundry_agents.py`: builds and streams the two agents.
- `src/config.py`: environment configuration.
- `create_toolbox.py`: one-time toolbox creation script.
