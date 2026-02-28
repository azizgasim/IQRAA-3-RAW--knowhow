from __future__ import annotations
from dataclasses import dataclass
from typing import Optional

from memory.base import MemoryRecord


@dataclass
class MemoryGovernance:
    min_confidence: float = 0.5

    def allow_write(self, record: MemoryRecord) -> bool:
        return record.confidence >= self.min_confidence
