from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List

from knowledge.context_object import ContextObject


@dataclass
class ContextRegistry:
    objects: Dict[str, List[ContextObject]] = field(default_factory=dict)

    def register(self, obj: ContextObject) -> None:
        self.objects.setdefault(obj.layer, []).append(obj)

    def get_by_layer(self, layer: str) -> List[ContextObject]:
        return self.objects.get(layer, [])
