from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, Any

from core.context import ExecutionContext
from knowledge.retriever import Retriever


@dataclass
class ContextEnricher:
    retriever: Retriever

    def enrich(self, ctx: ExecutionContext, layer: str) -> None:
        contexts = self.retriever.retrieve(layer)
        ctx.outputs.setdefault("context", {})[layer] = [
            {"id": c.context_id, "payload": c.payload, "confidence": c.confidence}
            for c in contexts
        ]
