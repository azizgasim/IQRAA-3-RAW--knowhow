from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class KnowledgeNode:
    node_id: str
    label: str
    attributes: Dict[str, str] = field(default_factory=dict)


@dataclass
class KnowledgeEdge:
    src: str
    dst: str
    relation: str


@dataclass
class KnowledgeGraph:
    nodes: Dict[str, KnowledgeNode] = field(default_factory=dict)
    edges: List[KnowledgeEdge] = field(default_factory=list)

    def add_node(self, node: KnowledgeNode) -> None:
        self.nodes[node.node_id] = node

    def add_edge(self, edge: KnowledgeEdge) -> None:
        self.edges.append(edge)

    def neighbors(self, node_id: str) -> List[KnowledgeNode]:
        return [
            self.nodes[e.dst]
            for e in self.edges
            if e.src == node_id and e.dst in self.nodes
        ]
