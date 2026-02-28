from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict

from agents.base import BaseAgent


@dataclass
class WritingAgent(BaseAgent):
    def act(self, ctx_view: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "kind": "write",
            "draft": "Phase Beta stub: writing placeholder",
        }
