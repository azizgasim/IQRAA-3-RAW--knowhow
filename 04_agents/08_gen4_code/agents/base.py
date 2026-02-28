from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class BaseAgent:
    agent_id: str
    role: str

    def act(self, ctx_view: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError
