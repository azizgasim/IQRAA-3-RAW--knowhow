from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict

from memory.base import MemoryBase, MemoryRecord


@dataclass
class ShortTermMemory(MemoryBase):
    buffer: Dict[str, MemoryRecord] = field(default_factory=dict)

    def write(self, record: MemoryRecord) -> None:
        self.buffer[record.key] = record

    def read(self, key: str) -> MemoryRecord | None:
        return self.buffer.get(key)
