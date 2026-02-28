#!/usr/bin/env python3
"""
Arabic Chunker — تقطيع 300 كلمة + تداخل
DEC-P1-007
"""
import hashlib
import logging
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional

logger = logging.getLogger("pipeline.chunker")

DEFAULT_CHUNK_SIZE = 300
DEFAULT_OVERLAP = 30
MIN_CHUNK_SIZE = 20
PARAGRAPH_BOUNDARIES = re.compile(r'\n\s*\n')

@dataclass
class Chunk:
    text: str
    chunk_index: int
    word_count: int
    char_count: int
    start_word: int
    end_word: int
    content_hash: str
    has_overlap: bool
    metadata: Dict = field(default_factory=dict)

@dataclass
class ChunkingResult:
    chunks: List[Chunk]
    total_chunks: int = 0
    total_words: int = 0
    source_path: str = ""
    source_hash: str = ""
    def __post_init__(self):
        self.total_chunks = len(self.chunks)
        self.total_words = sum(c.word_count for c in self.chunks)

class ArabicChunker:
    def __init__(self, chunk_size=DEFAULT_CHUNK_SIZE, overlap=DEFAULT_OVERLAP, min_chunk_size=MIN_CHUNK_SIZE):
        if overlap >= chunk_size: raise ValueError("التداخل يجب أن يكون أقل من حجم القطعة")
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.min_chunk_size = min_chunk_size

    def chunk(self, text: str, source_path: str = "", metadata: Optional[Dict] = None) -> ChunkingResult:
        if not text or not text.strip(): return ChunkingResult(chunks=[], source_path=source_path)
        source_hash = self._hash(text)
        base_meta = metadata or {}
        paragraphs = PARAGRAPH_BOUNDARIES.split(text.strip())
        paragraphs = [p.strip() for p in paragraphs if p.strip()]
        all_words = []
        for para in paragraphs:
            all_words.extend(para.split())
            all_words.append("\n\n")
        if all_words and all_words[-1] == "\n\n": all_words.pop()
        chunks = []
        word_pos = 0
        chunk_index = 0
        while word_pos < len(all_words):
            end_pos = min(word_pos + self.chunk_size, len(all_words))
            window = all_words[word_pos:end_pos]
            if end_pos < len(all_words):
                adj = self._find_sentence_boundary(window)
                if adj > 0: window = window[:adj]; end_pos = word_pos + adj
            chunk_text = self._words_to_text(window)
            wc = len([w for w in window if w != "\n\n"])
            if wc < self.min_chunk_size and chunk_index > 0 and end_pos < len(all_words) and chunks:
                prev = chunks[-1]
                merged = prev.text + "\n\n" + chunk_text
                chunks[-1] = Chunk(text=merged, chunk_index=prev.chunk_index, word_count=prev.word_count+wc,
                    char_count=len(merged), start_word=prev.start_word, end_word=end_pos,
                    content_hash=self._hash(merged), has_overlap=prev.has_overlap, metadata={**base_meta, **prev.metadata})
                word_pos = end_pos; continue
            chunks.append(Chunk(text=chunk_text, chunk_index=chunk_index, word_count=wc, char_count=len(chunk_text),
                start_word=word_pos, end_word=end_pos, content_hash=self._hash(chunk_text),
                has_overlap=chunk_index > 0 and word_pos < (chunks[-1].end_word if chunks else 0), metadata=base_meta.copy()))
            chunk_index += 1
            word_pos += max(1, len(window) - self.overlap)
        return ChunkingResult(chunks=chunks, source_path=source_path, source_hash=source_hash)

    def _find_sentence_boundary(self, words):
        start = max(len(words) * 2 // 3, 1)
        for i in range(len(words)-1, start-1, -1):
            if words[i] == "\n\n": return i
            if words[i] and words[i][-1] in ".!?؟،؛": return i + 1
        return 0

    @staticmethod
    def _words_to_text(words):
        parts = []
        for w in words:
            if w == "\n\n": parts.append("\n\n")
            else:
                if parts and parts[-1] != "\n\n": parts.append(" ")
                parts.append(w)
        return "".join(parts).strip()

    @staticmethod
    def _hash(text): return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
