from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, Any


@dataclass
class ContextObject:
    context_id: str
    layer: str
    payload: Dict[str, Any]
    confidence: float = 0.7
