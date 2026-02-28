from __future__ import annotations

from typing import Any, Dict

from eval.quality_engine import QualityEngine
from eval.regression import RegressionChecker
from cost.cost_guardian import CostGuardian
from cost.roi import ROIEngine
from knowledge.retriever import KnowledgeRetriever


class OrchestratorWiring:
	def __init__(self) -> None:
		self.quality_engine = QualityEngine()
		self.regression_checker = RegressionChecker()
		self.cost_guardian = CostGuardian()
		self.roi_engine = ROIEngine()
		self.retriever = KnowledgeRetriever()

	def enrich_context(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
		query = ctx.get("query")
		if not query:
			return ctx
		ctx["knowledge"] = self.retriever.retrieve(query)
		return ctx

	def preflight_cost(self, estimate_usd: float, cap_usd: float):
		return self.cost_guardian.preflight(estimate_usd, cap_usd)

	def post_evaluate(self, output: Any, baseline: Dict[str, float]):
		quality = self.quality_engine.evaluate(output, criteria={"default": True})
		regression = self.regression_checker.check(baseline, {"quality": quality.score})
		roi = self.roi_engine.compute(
			benefits={"quality": quality.score},
			costs={"cost": 1.0},
		)
		return {
			"quality": quality,
			"regression": regression,
			"roi": roi,
		}
