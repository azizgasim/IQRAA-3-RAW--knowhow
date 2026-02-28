from __future__ import annotations

from typing import Any, Dict

from core.context import ExecutionContext
from core.orchestrator import Orchestrator

from governance.gate_registry import GateRegistry
from governance.policy_engine import PolicyEngine
from governance.budget_engine import BudgetEngine
from governance.audit_engine import AuditEngine

from execution.model_router import ModelRouter
from execution.tool_runner import ToolRunner
from execution.sandbox import Sandbox
from execution.job_manager import JobManager

from agents.research_agent import ResearchAgent
from agents.analysis_agent import AnalysisAgent
from agents.writing_agent import WritingAgent
from agents.reviewer_agent import ReviewerAgent
from core.creative_elite import CreativeNode


def build_default_orchestrator() -> Orchestrator:
    gates = GateRegistry().build_default()

    policy_engine = PolicyEngine(rules={
        "orchestration": {
            "required_permissions": ["orchestrate"],
            "forbidden": ["unsafe_execute"],
        }
    })
    budget_engine = BudgetEngine(hard_stop=True)
    audit_engine = AuditEngine(enabled=True)

    model_router = ModelRouter()
    tool_runner = ToolRunner()
    sandbox = Sandbox(enabled=True)
    job_manager = JobManager()

    # Distinct IDs to satisfy Gate-1
    research = ResearchAgent(agent_id="agent-research-01", role="research")
    analysis = AnalysisAgent(agent_id="agent-analysis-01", role="analysis")
    writing = WritingAgent(agent_id="agent-writing-01", role="writing")
    reviewer = ReviewerAgent(agent_id="agent-reviewer-01", role="reviewer")

    creative_node = CreativeNode()

    return Orchestrator(
        gates=gates,
        policy_engine=policy_engine,
        budget_engine=budget_engine,
        audit_engine=audit_engine,
        model_router=model_router,
        tool_runner=tool_runner,
        sandbox=sandbox,
        job_manager=job_manager,
        research_agent=research,
        analysis_agent=analysis,
        writing_agent=writing,
        reviewer_agent=reviewer,
        creative_node=creative_node,
    )


def run_beta_smoke(request: Dict[str, Any]) -> ExecutionContext:
    orch = build_default_orchestrator()
    ctx = ExecutionContext(
        actor_agent_id="agent-orchestrator-01",
        actor_role="orchestrator",
        permissions=["orchestrate"],
        request=request,
    )
    # Explicit plan required in orchestrator
    orch._build_default_plan(ctx)
    return orch.run(ctx)
