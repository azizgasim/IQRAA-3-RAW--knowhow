from __future__ import annotations

from knowledge.context_registry import ContextRegistry
from knowledge.context_object import ContextObject
from knowledge.retrieval_policy import RetrievalPolicy
from knowledge.retriever import Retriever
from core.context_enrichment import ContextEnricher
from memory.short_term import ShortTermMemory
from memory.long_term import LongTermMemory
from memory.memory_governance import MemoryGovernance
from memory.base import MemoryRecord


def build_knowledge_stack():
    registry = ContextRegistry()
    registry.register(ContextObject(
        context_id="hist-001",
        layer="historical",
        payload={"note": "Example historical context"},
        confidence=0.8,
    ))

    retriever = Retriever(
        registry=registry,
        policy=RetrievalPolicy(max_items=3, min_confidence=0.6),
    )
    enricher = ContextEnricher(retriever=retriever)

    stm = ShortTermMemory()
    ltm = LongTermMemory()
    gov = MemoryGovernance(min_confidence=0.6)

    return {
        "registry": registry,
        "retriever": retriever,
        "enricher": enricher,
        "short_term": stm,
        "long_term": ltm,
        "governance": gov,
    }
