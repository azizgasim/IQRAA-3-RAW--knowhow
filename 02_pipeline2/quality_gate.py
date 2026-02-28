#!/usr/bin/env python3
"""
Quality Gate — 4 معايير جودة
DEC-P1-008
"""
import logging
import re
import unicodedata
from collections import Counter
from dataclasses import dataclass, field
from typing import Dict, List, Tuple

logger = logging.getLogger("pipeline.quality_gate")

DEFAULT_MIN_LENGTH = 50
DEFAULT_MIN_ARABIC_RATIO = 0.60
DEFAULT_MIN_UNICODE_VALID = 0.95
DEFAULT_MAX_REPETITION_RATIO = 0.20

ARABIC_RANGES = [(0x0600,0x06FF),(0x0750,0x077F),(0x08A0,0x08FF),(0xFB50,0xFDFF),(0xFE70,0xFEFF)]
PROBLEMATIC_CHARS = set(['\ufffd','\ufeff','\x00'])

LATIN_RANGES = [(0x0041,0x005A),(0x0061,0x007A),(0x00C0,0x00FF)]
DEFAULT_MIN_LATIN_RATIO = 0.50

SUPPORTED_LANGUAGES = {"ar", "en", "mixed"}

@dataclass
class QualityFlag:
    name: str
    passed: bool
    value: float
    threshold: float
    detail: str = ""

@dataclass
class QualityResult:
    passed: bool
    score: float
    flags: List[QualityFlag] = field(default_factory=list)
    text_length: int = 0
    arabic_ratio: float = 0.0
    unicode_valid_ratio: float = 0.0
    repetition_ratio: float = 0.0
    @property
    def failed_flags(self) -> List[str]: return [f.name for f in self.flags if not f.passed]
    @property
    def flag_names(self) -> List[str]: return self.failed_flags
    def to_dict(self) -> Dict:
        return {"passed": self.passed, "score": round(self.score, 4), "text_length": self.text_length,
                "arabic_ratio": round(self.arabic_ratio, 4), "unicode_valid_ratio": round(self.unicode_valid_ratio, 4),
                "repetition_ratio": round(self.repetition_ratio, 4), "failed_flags": self.failed_flags}

class QualityGate:
    def __init__(self, min_length=DEFAULT_MIN_LENGTH, min_arabic_ratio=DEFAULT_MIN_ARABIC_RATIO,
                 min_unicode_valid=DEFAULT_MIN_UNICODE_VALID, max_repetition_ratio=DEFAULT_MAX_REPETITION_RATIO,
                 language="ar", min_latin_ratio=DEFAULT_MIN_LATIN_RATIO):
        if language not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language: {language}. Use: {SUPPORTED_LANGUAGES}")
        self.language = language
        self.min_length = min_length
        self.min_unicode_valid = min_unicode_valid
        self.max_repetition_ratio = max_repetition_ratio
        # ضبط عتبات اللغة حسب النوع
        if language == "ar":
            self.min_arabic_ratio = min_arabic_ratio
            self.min_latin_ratio = 0.0
        elif language == "en":
            self.min_arabic_ratio = 0.0
            self.min_latin_ratio = min_latin_ratio
        else:  # mixed
            self.min_arabic_ratio = 0.0
            self.min_latin_ratio = 0.0

    def check(self, text: str) -> QualityResult:
        if not text:
            return QualityResult(passed=False, score=0.0, flags=[QualityFlag("length", False, 0, self.min_length, "فارغ")])
        flags = []
        length = len(text.strip())
        flags.append(QualityFlag("length", length >= self.min_length, length, self.min_length))
        # فحص اللغة حسب النوع
        ar = self._arabic_ratio(text)
        if self.language == "ar":
            flags.append(QualityFlag("arabic_ratio", ar >= self.min_arabic_ratio, ar, self.min_arabic_ratio))
        elif self.language == "en":
            lr = self._latin_ratio(text)
            flags.append(QualityFlag("latin_ratio", lr >= self.min_latin_ratio, lr, self.min_latin_ratio))
        else:  # mixed — لا فحص لغة، الفحوصات الأخرى كافية
            flags.append(QualityFlag("language_ratio", True, 1.0, 0.0, "mixed — skipped"))
        uv = self._unicode_valid_ratio(text)
        flags.append(QualityFlag("unicode_valid", uv >= self.min_unicode_valid, uv, self.min_unicode_valid))
        rr = self._repetition_ratio(text)
        flags.append(QualityFlag("repetition", rr <= self.max_repetition_ratio, rr, self.max_repetition_ratio))
        all_passed = all(f.passed for f in flags)
        weights = {"length": 0.15, "arabic_ratio": 0.35, "latin_ratio": 0.35, "language_ratio": 0.35, "unicode_valid": 0.25, "repetition": 0.25}
        score = min(1.0, sum(weights.get(f.name, 0.25) * (1.0 if f.passed else max(0, f.value / f.threshold if f.threshold > 0 else 0)) for f in flags))
        return QualityResult(passed=all_passed, score=score, flags=flags, text_length=length, arabic_ratio=ar, unicode_valid_ratio=uv, repetition_ratio=rr)

    @staticmethod
    def _is_arabic_char(ch): return any(s <= ord(ch) <= e for s, e in ARABIC_RANGES)

    def _arabic_ratio(self, text):
        chars = [ch for ch in text if not ch.isspace() and not ch.isdigit() and ch not in '.,;:!?()[]{}«»"\'']
        if not chars: return 0.0
        return sum(1 for ch in chars if self._is_arabic_char(ch)) / len(chars)

    @staticmethod
    def _is_latin_char(ch):
        return any(s <= ord(ch) <= e for s, e in LATIN_RANGES)

    def _latin_ratio(self, text):
        chars = [ch for ch in text if not ch.isspace() and not ch.isdigit() and ch not in '.,;:!?()[]{}«»"\'']
        if not chars: return 0.0
        return sum(1 for ch in chars if self._is_latin_char(ch)) / len(chars)

    @staticmethod
    def _unicode_valid_ratio(text):
        if not text: return 1.0
        total = len(text)
        bad = sum(1 for ch in text if ch in PROBLEMATIC_CHARS or unicodedata.category(ch) == "Cn")
        return 1.0 - (bad / total)

    @staticmethod
    def _repetition_ratio(text):
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        if len(lines) <= 1: return 0.0
        counts = Counter(lines)
        return sum(c - 1 for c in counts.values() if c > 1) / len(lines)
