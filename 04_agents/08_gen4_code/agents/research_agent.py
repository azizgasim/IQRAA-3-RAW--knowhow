from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict

from agents.base import BaseAgent


@dataclass
class ResearchAgent(BaseAgent):
    def act(self, ctx_view: Dict[str, Any]) -> Dict[str, Any]:
        topic = ctx_view.get("request", {}).get("topic", "unknown")
        return {
            "kind": "research",
            "topic": topic,
            "notes": ["Phase Beta stub: research output placeholder"],
            "sources": [],
        }
