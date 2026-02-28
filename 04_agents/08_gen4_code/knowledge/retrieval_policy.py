from __future__ import annotations
from dataclasses import dataclass
from typing import List

from knowledge.context_object import ContextObject


@dataclass
class RetrievalPolicy:
    max_items: int = 5
    min_confidence: float = 0.5

    def filter(self, items: List[ContextObject]) -> List[ContextObject]:
        eligible = [i for i in items if i.confidence >= self.min_confidence]
        return eligible[: self.max_items]
