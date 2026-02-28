import re
from typing import Optional


class OpenITICleaner:
    """ينظف نصوص OpenITI من الرموز والميتاداتا غير الضرورية"""

    def __init__(self, aggressive: bool = False):
        self.aggressive = aggressive
        self.patterns = [
            (re.compile(r'#META#.*?(\n|$)', re.MULTILINE),          ' '),
            (re.compile(r'#META#Header#End#', re.MULTILINE),         ''),
            (re.compile(r'######OpenITI#.*?(\n|$)', re.MULTILINE),   ''),
            (re.compile(r'######\S*', re.MULTILINE),                  ''),
            (re.compile(r'### \|+'),                                  ''),
            (re.compile(r'# +\$\$\$'),                               ''),
            (re.compile(r'# +---'),                                   ''),
            (re.compile(r'\|[A-Z]{3}\d+\|'),                         ''),
            (re.compile(r'\bms\d+\b', re.IGNORECASE),                ''),
            (re.compile(r'PageV\d+P\d+:?', re.IGNORECASE),           ''),
            (re.compile(r'(?i)vol\d+p\d+'),                          ''),
            (re.compile(r'^~~\s*', re.MULTILINE),                     ''),
            (re.compile(r'\s*~~\s*'),                                  ' '),
            (re.compile(r'_{3,}'),                                     ' '),
            (re.compile(r'-{3,}'),                                     ' '),
            (re.compile(r'={3,}'),                                     ' '),
            (re.compile(r'\.{5,}'),                                    '...'),
            (re.compile(r'\(¬?\d+\)'),                                ''),
            (re.compile(r'^\d+\s*[-]\s*', re.MULTILINE),             ''),
            (re.compile(r'[ \t]{2,}'),                                 ' '),
            (re.compile(r'\n{3,}'),                                    '\n\n'),
        ]
        if self.aggressive:
            self.patterns += [
                (re.compile(r'\(\d+/\d+\)'), ''),
                (re.compile(r'\[\d+\]'),      ''),
            ]

    def clean(self, text: str) -> str:
        if not text:
            return text
        result = text
        for pattern, replacement in self.patterns:
            result = pattern.sub(replacement, result)
        result = result.strip()
        result = re.sub(r'\n\s*\n\s*\n', '\n\n', result)
        return result

    def clean_batch(self, texts: list) -> list:
        return [self.clean(t) for t in texts]

    def stats(self, original: str, cleaned: str) -> dict:
        orig_len  = len(original)
        clean_len = len(cleaned)
        return {
            "original_chars": orig_len,
            "cleaned_chars":  clean_len,
            "reduction_pct":  round((orig_len - clean_len) / max(orig_len,1) * 100, 1),
            "original_words": len(original.split()),
            "cleaned_words":  len(cleaned.split()),
        }


def clean_text(text: str, aggressive: bool = False) -> str:
    """دالة سريعة للتنظيف المباشر"""
    return OpenITICleaner(aggressive).clean(text)
