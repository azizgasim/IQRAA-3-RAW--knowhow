#!/usr/bin/env python3
"""
Text Cleaner — تنظيف واعٍ باللغة
DEC-P1-027: LanguageAwareCleaner

يوفر تنظيفاً مخصصاً حسب اللغة:
  - ArabicCleaner: تطبيع الألف/الياء/التاء + إزالة التشكيل + تنظيف عام
  - EnglishCleaner: تطبيع Unicode NFC + تنظيف عام
  - MixedCleaner: تنظيف آمن للغتين (عام فقط)

الاستخدام:
    from text_cleaner import get_cleaner
    cleaner = get_cleaner("ar")  # أو "en" أو "mixed"
    result = cleaner.clean(text)
"""
import logging
import re
import unicodedata
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger("pipeline.cleaner")


@dataclass
class CleanResult:
    """نتيجة التنظيف — مشتركة بين جميع المنظّفات."""
    text: str
    original_length: int = 0
    cleaned_length: int = 0
    quick_applied: bool = False
    deep_applied: bool = False
    changes: list = field(default_factory=list)

    @property
    def reduction_ratio(self) -> float:
        return 1.0 - (self.cleaned_length / self.original_length) if self.original_length else 0.0


# ── أنماط مشتركة ──
INVISIBLE_CHARS = re.compile(
    "[\u200b\u200c\u200d\u200e\u200f\u202a\u202b\u202c\u202d\u202e"
    "\u2066\u2067\u2068\u2069\ufeff\u00ad\u0000-\u0008\u000b\u000c\u000e-\u001f]"
)
MULTI_SPACES = re.compile(r'[ \t]{2,}')
MULTI_NEWLINES = re.compile(r'\n{3,}')
REPEATED_PUNCT = re.compile(r'([.!?،؟؛:…])\1{2,}')

# ── أنماط عربية ──
ALEF_MAP = str.maketrans({"\u0622": "\u0627", "\u0623": "\u0627", "\u0625": "\u0627", "\u0671": "\u0627"})
YA_TA_MAP = str.maketrans({"\u0649": "\u064A", "\u0629": "\u0647"})
DIACRITICS = re.compile(
    "[\u0617-\u061A\u064B-\u0652\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED]"
)


class BaseCleaner(ABC):
    """واجهة مجرّدة لكل المنظّفات."""

    def __init__(self, deep_threshold: float = 0.7):
        self.deep_threshold = deep_threshold

    def _common_clean(self, text: str) -> str:
        if not text:
            return ""
        text = INVISIBLE_CHARS.sub("", text)
        text = MULTI_SPACES.sub(" ", text)
        text = REPEATED_PUNCT.sub(r"\1", text)
        text = MULTI_NEWLINES.sub("\n\n", text)
        lines = text.split("\n")
        lines = [line.strip() for line in lines]
        return "\n".join(lines).strip()

    @abstractmethod
    def quick_clean(self, text: str) -> str: ...

    @abstractmethod
    def deep_clean(self, text: str) -> str: ...

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
        return CleanResult(
            text=text, original_length=original_length,
            cleaned_length=len(text), quick_applied=True,
            deep_applied=deep_applied, changes=changes,
        )


class ArabicCleaner(BaseCleaner):
    """تنظيف عربي: تطبيع الألف/الياء/التاء + إزالة التشكيل. DEC-P1-006"""

    def __init__(self, remove_diacritics=True, normalize_alef=True, normalize_ya_ta=True, deep_threshold=0.7):
        super().__init__(deep_threshold=deep_threshold)
        self.remove_diacritics = remove_diacritics
        self.normalize_alef = normalize_alef
        self.normalize_ya_ta = normalize_ya_ta
        self._deep_available = None

    def quick_clean(self, text: str) -> str:
        text = self._common_clean(text)
        if not text:
            return ""
        if self.remove_diacritics:
            text = DIACRITICS.sub("", text)
        if self.normalize_alef:
            text = text.translate(ALEF_MAP)
        if self.normalize_ya_ta:
            text = text.translate(YA_TA_MAP)
        return text

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
        if not self._check_deep_available():
            return text
        try:
            from camel_tools.utils.normalize import normalize_unicode
            from camel_tools.utils.dediac import dediac_ar
            text = normalize_unicode(text)
            if self.remove_diacritics:
                text = dediac_ar(text)
            return text
        except Exception as e:
            logger.error("خطأ في التنظيف العميق: %s", e)
            return text


class EnglishCleaner(BaseCleaner):
    """تنظيف إنجليزي: Unicode NFC + تنظيف عام. DEC-P1-027"""

    def quick_clean(self, text: str) -> str:
        text = unicodedata.normalize("NFC", text) if text else ""
        return self._common_clean(text)

    def deep_clean(self, text: str) -> str:
        return text


class MixedCleaner(BaseCleaner):
    """تنظيف مختلط: عام فقط — لا تطبيع لغوي. DEC-P1-027"""

    def quick_clean(self, text: str) -> str:
        text = unicodedata.normalize("NFC", text) if text else ""
        return self._common_clean(text)

    def deep_clean(self, text: str) -> str:
        return text


SUPPORTED_LANGUAGES = {"ar", "en", "mixed"}


def get_cleaner(language: str = "ar", **kwargs) -> BaseCleaner:
    """
    إنشاء المنظّف المناسب حسب اللغة.

    Args:
        language: "ar" | "en" | "mixed"
        **kwargs: معاملات إضافية (مثل remove_diacritics, deep_threshold)

    Returns:
        BaseCleaner المناسب

    Raises:
        ValueError: لغة غير مدعومة
    """
    if language not in SUPPORTED_LANGUAGES:
        raise ValueError(f"لغة غير مدعومة: {language!r}. المدعومة: {SUPPORTED_LANGUAGES}")
    if language == "ar":
        return ArabicCleaner(**kwargs)
    elif language == "en":
        return EnglishCleaner(deep_threshold=kwargs.get("deep_threshold", 0.7))
    else:
        return MixedCleaner(deep_threshold=kwargs.get("deep_threshold", 0.7))
