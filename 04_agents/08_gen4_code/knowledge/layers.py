from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List


@dataclass(frozen=True)
class KnowledgeLayer:
    name: str
    description: str


DEFAULT_LAYERS: List[KnowledgeLayer] = [
    KnowledgeLayer("linguistic", "Language, semantics, terminology"),
    KnowledgeLayer("historical", "Time, events, chronology"),
    KnowledgeLayer("social", "Social structures and norms"),
    KnowledgeLayer("political", "Power, authority, governance"),
    KnowledgeLayer("economic", "Resources, incentives, scarcity"),
    KnowledgeLayer("doctrinal", "Belief systems and creeds"),
    KnowledgeLayer("technical", "Media, tools, transmission tech"),
]
