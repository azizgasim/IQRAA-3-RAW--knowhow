from __future__ import annotations

from typing import Any, Dict

from core.orchestrator_wiring import OrchestratorWiring


class FinalContext:
    def __init__(self, plan: Dict[str, Any]):
        self.plan = plan
        self.stop_now = False
        self.stop_reason = None
        self.outputs: Dict[str, Any] = {}


def run_final(plan: Dict[str, Any]) -> FinalContext:
    """
    Final authoritative execution path.
    Enforces: plan -> cost preflight -> context enrichment -> execution -> post eval
    """
    ctx = FinalContext(plan=plan)
    wiring = OrchestratorWiring()

    # 1) Plan enforcement
    if not plan or "intent" not in plan:
        ctx.stop_now = True
        ctx.stop_reason = "MISSING_PLAN_INTENT"
        return ctx

    # 2) Cost preflight
    estimate = float(plan.get("estimated_cost_usd", 0.0))
    cap = float(plan.get("cap_usd", 0.0))
    decision = wiring.preflight_cost(estimate, cap)
    if not decision.allowed:
        ctx.stop_now = True
        ctx.stop_reason = "COST_CAP_EXCEEDED"
        return ctx

    # 3) Context enrichment (optional)
    base_ctx = {"query": plan.get("query")}
    enriched_ctx = wiring.enrich_context(base_ctx)

    # 4) Core execution (stub execution body)
    output = {
        "intent": plan["intent"],
        "context": enriched_ctx,
        "result": "EXECUTION_OK",
    }

    # 5) Post execution evaluation
    post = wiring.post_evaluate(
        output=output,
        baseline={"quality": float(plan.get("baseline_quality", 0.0))},
    )

    ctx.outputs = {
        "execution": output,
        "evaluation": post,
    }
    return ctx
