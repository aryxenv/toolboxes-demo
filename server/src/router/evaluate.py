"""Evaluation endpoints — real scores from the Azure AI Evaluation SDK.

Two phases, matching the demo UX:

* ``/api/evaluate/quick`` — Relevance + Coherence (need only query + response).
  Fires per panel as soon as that agent finishes streaming.
* ``/api/evaluate/full``  — Groundedness + Similarity + Retrieval. Fires once
  both panels finish. The toolbox agent's ``context`` is the evidence it
  retrieved via its tools; the plain agent has none. The toolbox answer is used
  as ``ground_truth`` for similarity (the grounded reference).

Evaluators are LLM-as-judge, returning a 1-5 score that we normalize to 0-100%.
Docs: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/rag-evaluators
"""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor

from azure.identity import DefaultAzureCredential
from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..config import (
    AZURE_OPENAI_API_VERSION,
    AZURE_OPENAI_ENDPOINT,
    EVAL_MODEL_DEPLOYMENT,
    require,
)

router = APIRouter(prefix="/api/evaluate", tags=["evaluate"])

_credential = DefaultAzureCredential()


def _model_config() -> dict:
    require("AZURE_OPENAI_ENDPOINT", AZURE_OPENAI_ENDPOINT)
    return {
        "azure_endpoint": AZURE_OPENAI_ENDPOINT,
        "azure_deployment": EVAL_MODEL_DEPLOYMENT,
        "api_version": AZURE_OPENAI_API_VERSION,
    }


def _run_evaluator(evaluator_cls, kwargs: dict) -> dict:
    evaluator = evaluator_cls(model_config=_model_config(), credential=_credential)
    return evaluator(**kwargs)


def _normalize(score: float | None) -> float:
    """Convert a 1-5 evaluator score to a 0-100 percentage."""
    try:
        return round((float(score) / 5) * 100, 1)
    except (TypeError, ValueError):
        return 0.0


class QuickScores(BaseModel):
    relevance: float
    coherence: float


class FullScores(BaseModel):
    groundedness: float
    similarity: float
    retrieval: float


class QuickEvalRequest(BaseModel):
    query: str = Field(..., min_length=1)
    response: str = Field(..., min_length=1)


class FullEvalRequest(BaseModel):
    query: str = Field(..., min_length=1)
    toolbox_response: str = Field(..., min_length=1)
    plain_response: str = Field(..., min_length=1)
    toolbox_context: str = ""
    plain_context: str = ""


class FullEvalResponse(BaseModel):
    toolbox: FullScores
    plain: FullScores


@router.post("/quick", response_model=QuickScores)
async def evaluate_quick(body: QuickEvalRequest) -> QuickScores:
    from azure.ai.evaluation import CoherenceEvaluator, RelevanceEvaluator

    with ThreadPoolExecutor(max_workers=2) as pool:
        relevance = pool.submit(
            _run_evaluator,
            RelevanceEvaluator,
            {"query": body.query, "response": body.response},
        )
        coherence = pool.submit(
            _run_evaluator,
            CoherenceEvaluator,
            {"query": body.query, "response": body.response},
        )
    return QuickScores(
        relevance=_normalize(relevance.result().get("relevance")),
        coherence=_normalize(coherence.result().get("coherence")),
    )


def _full_eval_one(query: str, response: str, context: str, ground_truth: str) -> FullScores:
    from azure.ai.evaluation import (
        GroundednessEvaluator,
        RetrievalEvaluator,
        SimilarityEvaluator,
    )

    # Groundedness/Retrieval need context; with no tools there is none to ground
    # in, so those scores land low — an honest reflection of the baseline.
    safe_context = context or "(no retrieved context — the agent has no tools)"
    with ThreadPoolExecutor(max_workers=3) as pool:
        groundedness = pool.submit(
            _run_evaluator,
            GroundednessEvaluator,
            {"query": query, "response": response, "context": safe_context},
        )
        similarity = pool.submit(
            _run_evaluator,
            SimilarityEvaluator,
            {"query": query, "response": response, "ground_truth": ground_truth},
        )
        retrieval = pool.submit(
            _run_evaluator,
            RetrievalEvaluator,
            {"query": query, "context": safe_context},
        )
    return FullScores(
        groundedness=_normalize(groundedness.result().get("groundedness")),
        similarity=_normalize(similarity.result().get("similarity")),
        retrieval=_normalize(retrieval.result().get("retrieval")),
    )


@router.post("/full", response_model=FullEvalResponse)
async def evaluate_full(body: FullEvalRequest) -> FullEvalResponse:
    # The grounded toolbox answer is the reference for similarity on both sides.
    ground_truth = body.toolbox_response
    with ThreadPoolExecutor(max_workers=2) as pool:
        toolbox = pool.submit(
            _full_eval_one,
            body.query,
            body.toolbox_response,
            body.toolbox_context,
            ground_truth,
        )
        plain = pool.submit(
            _full_eval_one,
            body.query,
            body.plain_response,
            body.plain_context,
            ground_truth,
        )
    return FullEvalResponse(toolbox=toolbox.result(), plain=plain.result())
