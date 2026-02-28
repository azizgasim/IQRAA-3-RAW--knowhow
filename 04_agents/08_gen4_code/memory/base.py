from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class MemoryRecord:
    key: str
    value: Dict[str, Any]
    confidence: float = 0.8


class MemoryBase:
    def write(self, record: MemoryRecord) -> None:
        raise NotImplementedError

    def read(self, key: str) -> MemoryRecord | None:
        raise NotImplementedError
