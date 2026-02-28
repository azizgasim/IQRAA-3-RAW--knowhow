from __future__ import annotations
from dataclasses import dataclass
from typing import List, Dict, Any

from knowledge.context_registry import ContextRegistry
from knowledge.context_object import ContextObject
from knowledge.retrieval_policy import RetrievalPolicy


@dataclass
class Retriever:
    registry: ContextRegistry
    policy: RetrievalPolicy

    def retrieve(self, layer: str) -> List[ContextObject]:
        items = self.registry.get_by_layer(layer)
        return self.policy.filter(items)


class KnowledgeRetriever:
    def retrieve(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        # Stubbed retrieval to keep wiring functional without external data sources
        return []
