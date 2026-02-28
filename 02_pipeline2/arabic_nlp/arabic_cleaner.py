#!/usr/bin/env python3
"""
Arabic Cleaner — تنظيف بطبقتين Quick+Deep
DEC-P1-006
"""
import logging
import re
import unicodedata
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger("pipeline.cleaner")

@dataclass
class CleanResult:
    text: str
    original_length: int = 0
    cleaned_length: int = 0
    quick_applied: bool = False
    deep_applied: bool = False
    changes: list = field(default_factory=list)
    @property
    def reduction_ratio(self) -> float:
        return 1.0 - (self.cleaned_length / self.original_length) if self.original_length else 0.0

ALEF_MAP = str.maketrans({"\u0622": "\u0627", "\u0623": "\u0627", "\u0625": "\u0627", "\u0671": "\u0627"})
YA_TA_MAP = str.maketrans({"\u0649": "\u064A", "\u0629": "\u0647"})
INVISIBLE_CHARS = re.compile("[\u200b\u200c\u200d\u200e\u200f\u202a\u202b\u202c\u202d\u202e\u2066\u2067\u2068\u2069\ufeff\u00ad\u0000-\u0008\u000b\u000c\u000e-\u001f]")
DIACRITICS = re.compile("[\u0617-\u061A\u064B-\u0652\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED]")
REPEATED_PUNCT = re.compile(r'([.!?،؟؛:…])\1{2,}')
MULTI_SPACES = re.compile(r'[ \t]{2,}')
MULTI_NEWLINES = re.compile(r'\n{3,}')

class ArabicCleaner:
    def __init__(self, remove_diacritics=True, normalize_alef=True, normalize_ya_ta=True, deep_threshold=0.7):
        self.remove_diacritics = remove_diacritics
        self.normalize_alef = normalize_alef
        self.normalize_ya_ta = normalize_ya_ta
        self.deep_threshold = deep_threshold
        self._deep_available = None

    def quick_clean(self, text: str) -> str:
        if not text: return ""
        text = INVISIBLE_CHARS.sub("", text)
        if self.remove_diacritics: text = DIACRITICS.sub("", text)
        if self.normalize_alef: text = text.translate(ALEF_MAP)
        if self.normalize_ya_ta: text = text.translate(YA_TA_MAP)
        text = MULTI_SPACES.sub(" ", text)
        text = REPEATED_PUNCT.sub(r"\1", text)
        text = MULTI_NEWLINES.sub("\n\n", text)
        lines = text.split("\n")
        lines = [line.strip() for line in lines]
        return "\n".join(lines).strip()

    def _check_deep_available(self) -> bool:
        if self._deep_available is None:
            try:
                from camel_tools.utils.normalize import normalize_unicode
                self._deep_available = True
            except ImportError:
                self._deep_available = False
                logger.warning("camel_tools غير متاح — التنظيف العميق معطّل")
        return self._deep_available

    def deep_clean(self, text: str) -> str:
        if not self._check_deep_available(): return text
        try:
            from camel_tools.utils.normalize import normalize_unicode
            from camel_tools.utils.dediac import dediac_ar
            text = normalize_unicode(text)
            if self.remove_diacritics: text = dediac_ar(text)
            return text
        except Exception as e:
            logger.error(f"خطأ في التنظيف العميق: {e}")
            return text

    def clean(self, text: str, quality_score: Optional[float] = None) -> CleanResult:
        original_length = len(text) if text else 0
        changes = []
        text = self.quick_clean(text)
        changes.append("quick_clean")
        deep_applied = False
        if quality_score is not None and quality_score < self.deep_threshold:
            text = self.deep_clean(text)
            deep_applied = True
            changes.append("deep_clean")
        return CleanResult(text=text, original_length=original_length, cleaned_length=len(text), quick_applied=True, deep_applied=deep_applied, changes=changes)
