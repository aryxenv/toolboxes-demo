"""Runtime configuration for the Foundry Toolboxes demo backend.

All values come from environment variables (loaded from ``server/.env`` by
``main.py``). Authentication uses ``DefaultAzureCredential`` (run ``az login``
locally, or a managed identity in Azure) — no API keys are stored in code.

See ``server/.env.example`` for the full list and prerequisites.
"""

from __future__ import annotations

import os


def _clean(value: str | None) -> str:
    return (value or "").strip().rstrip("/")


# Foundry project endpoint, e.g.
# https://<account>.services.ai.azure.com/api/projects/<project>
FOUNDRY_PROJECT_ENDPOINT = _clean(os.getenv("FOUNDRY_PROJECT_ENDPOINT"))

# Chat model deployment name in the Foundry project (both agents use it).
FOUNDRY_MODEL = (os.getenv("FOUNDRY_MODEL") or "gpt-4o").strip()

# Toolbox *consumer* MCP endpoint (always serves the default version):
# {project_endpoint}/toolboxes/{toolbox_name}/mcp?api-version=v1
FOUNDRY_TOOLBOX_ENDPOINT = _clean(os.getenv("FOUNDRY_TOOLBOX_ENDPOINT"))

# Entra ID token scope used to call the Foundry toolbox MCP endpoint.
TOOLBOX_SCOPE = "https://ai.azure.com/.default"

# Model config for azure-ai-evaluation (LLM-as-judge evaluators). Point at the
# Azure OpenAI endpoint of your Foundry resource.
AZURE_OPENAI_ENDPOINT = _clean(os.getenv("AZURE_OPENAI_ENDPOINT"))
AZURE_OPENAI_API_VERSION = (
    os.getenv("AZURE_OPENAI_API_VERSION") or "2024-12-01-preview"
).strip()
EVAL_MODEL_DEPLOYMENT = (os.getenv("EVAL_MODEL_DEPLOYMENT") or FOUNDRY_MODEL).strip()

# Azure AI Search connection — used to wire the "Agent + Tools" side directly
# (the no-tool-search baseline) and by create_toolbox.py for the toolbox tool.
AZURE_AI_SEARCH_CONNECTION_ID = (
    os.getenv("AZURE_AI_SEARCH_CONNECTION_ID") or ""
).strip()
AZURE_AI_SEARCH_INDEX = (os.getenv("AZURE_AI_SEARCH_INDEX") or "").strip()


class ConfigError(RuntimeError):
    """Raised when a required environment variable is missing."""


def require(name: str, value: str) -> str:
    """Return ``value`` or raise a presenter-friendly ConfigError."""
    if not value:
        raise ConfigError(
            f"Missing required environment variable {name!r}. "
            "Copy server/.env.example to server/.env and fill it in, then run "
            "`az login`. See server/.env.example for prerequisites."
        )
    return value
