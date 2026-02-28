#!/usr/bin/env python3
"""
OpenITI mARkdown Converter — محوّل صيغة OpenITI
====================================================
DEC-P1-014

Handles .mARkdown files and extensionless -ara1/-ara2 files from the
OpenITI corpus. Extracts clean Arabic text and structured metadata.

OpenITI mARkdown format:
  ######OpenITI#              — file header
  #META# key :: value         — metadata block
  #META#Header#End#           — end of metadata
  ### |PARATEXT|              — paratext section marker
  ### | N Title               — section/chapter header
  # (N) text                  — numbered text (e.g. Quran verses, hadith)
  # text                      — regular text line
  ~~continuation              — line continuation
  PageV00P000                 — page markers
  msNNN                       — manuscript markers (end of line)
"""
import logging
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger("pipeline.converter.openiti")

# Compiled patterns for performance
RE_PAGE_MARKER = re.compile(r"\s*PageV\d+P\d+\s*(?:ms\d+)?\s*$")
RE_PAGE_INLINE = re.compile(r"\s*PageV\d+P\d+\s*(?:ms\d+)?")
RE_MS_MARKER = re.compile(r"\s+ms\d+\s*$")
RE_SECTION_HEADER = re.compile(r"^###\s*\|.*\|?\s*$")
RE_SECTION_TITLED = re.compile(r"^###\s*\|\s*(\d+)\s+(.*)")
RE_META_LINE = re.compile(r"^#META#\s+(.+?)\s*::\s*(.*)")
RE_TEXT_LINE = re.compile(r"^#\s*(.*)")
RE_NUMBERED_TEXT = re.compile(r"^\((\d+)\)\s*(.*)")
RE_CONTINUATION = re.compile(r"^~~(.*)")


@dataclass
class OpenITIMetadata:
    """بيانات وصفية مستخرجة من رأس OpenITI"""
    book_uri: str = ""
    author_name: str = ""
    author_aka: str = ""
    author_born: str = ""
    author_died: str = ""
    book_title: str = ""
    book_subject: str = ""
    book_volumes: str = ""
    editor: str = ""
    publisher: str = ""
    lib_url: str = ""
    raw_meta: Dict[str, str] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, str]:
        result = {
            "book_uri": self.book_uri,
            "author_name": self.author_name,
            "author_aka": self.author_aka,
            "author_born": self.author_born,
            "author_died": self.author_died,
            "book_title": self.book_title,
            "book_subject": self.book_subject,
            "book_volumes": self.book_volumes,
            "editor": self.editor,
            "publisher": self.publisher,
            "lib_url": self.lib_url,
        }
        # Only include non-empty values
        return {k: v for k, v in result.items() if v and v != "NODATA"}


def parse_openiti_file(text: str) -> Tuple[str, OpenITIMetadata]:
    """
    Parse an OpenITI mARkdown file into clean text + metadata.
    
    Returns:
        (clean_text, metadata)
    """
    lines = text.split("\n")
    metadata = OpenITIMetadata()
    text_lines: List[str] = []
    in_header = True
    current_line = ""

    for line in lines:
        raw_line = line.rstrip()

        # ─── Header parsing ───
        if in_header:
            if raw_line.strip() == "#META#Header#End#":
                in_header = False
                continue
            if raw_line.strip().startswith("######OpenITI"):
                continue
            meta_match = RE_META_LINE.match(raw_line)
            if meta_match:
                key = meta_match.group(1).strip()
                value = meta_match.group(2).strip()
                if value and value != "NODATA":
                    metadata.raw_meta[key] = value
                    _assign_meta_field(metadata, key, value)
                continue
            # Still in header area (blank lines, etc.)
            continue

        # ─── Body parsing ───

        # Page markers (standalone line) — skip entirely
        if RE_PAGE_MARKER.match(raw_line):
            continue

        # Clean inline page markers and ms markers
        cleaned = RE_PAGE_INLINE.sub("", raw_line)
        cleaned = RE_MS_MARKER.sub("", cleaned)
        cleaned = cleaned.rstrip()

        # Section headers: ### |PARATEXT| or ### | N Title
        if RE_SECTION_HEADER.match(cleaned):
            # Flush current line
            if current_line:
                text_lines.append(current_line.strip())
                current_line = ""
            titled = RE_SECTION_TITLED.match(cleaned)
            if titled:
                section_title = titled.group(2).strip()
                if section_title:
                    text_lines.append("")
                    text_lines.append(section_title)
                    text_lines.append("")
            continue

        # Continuation line: ~~text
        cont_match = RE_CONTINUATION.match(cleaned)
        if cont_match:
            current_line += " " + cont_match.group(1).strip()
            continue

        # Text line: # text or # (N) text
        text_match = RE_TEXT_LINE.match(cleaned)
        if text_match:
            # Flush previous line
            if current_line:
                text_lines.append(current_line.strip())
                current_line = ""

            content = text_match.group(1).strip()
            if not content:
                # Empty # line = paragraph break
                text_lines.append("")
                continue

            # Remove verse/hadith numbering: (N) text → text
            num_match = RE_NUMBERED_TEXT.match(content)
            if num_match:
                content = num_match.group(2).strip()

            current_line = content
            continue

        # Any other line (rare) — treat as text if non-empty
        stripped = cleaned.strip()
        if stripped and not stripped.startswith("#"):
            if current_line:
                current_line += " " + stripped
            else:
                current_line = stripped

    # Flush last line
    if current_line:
        text_lines.append(current_line.strip())

    # Join and clean up multiple blank lines
    result = "\n".join(text_lines)
    result = re.sub(r"\n{3,}", "\n\n", result)
    result = result.strip()

    return result, metadata


def _assign_meta_field(meta: OpenITIMetadata, key: str, value: str) -> None:
    """Map OpenITI META keys to structured fields."""
    key_lower = key.lower()
    if "bookuri" in key_lower:
        meta.book_uri = value.lstrip("#").strip()
    elif "authorname" in key_lower:
        meta.author_name = value
    elif "authoraka" in key_lower:
        meta.author_aka = value
    elif "authorborn" in key_lower:
        meta.author_born = value
    elif "authordied" in key_lower and "019" not in key:
        meta.author_died = value
    elif "booktitle" in key_lower and "sub" not in key_lower and "alt" not in key_lower:
        meta.book_title = value
    elif "booksubj" in key_lower:
        meta.book_subject = value
    elif "bookvols" in key_lower:
        meta.book_volumes = value
    elif "ededitor" in key_lower:
        meta.editor = value
    elif "edpublisher" in key_lower:
        meta.publisher = value
    elif "liburl" in key_lower and "file" not in key_lower and "extra" not in key_lower:
        meta.lib_url = value


class OpenITIConverter:
    """
    Converter for OpenITI mARkdown format.
    
    Registered extensions: .mARkdown
    Also handles extensionless files with -ara1/-ara2 pattern.
    """

    ENCODINGS = ["utf-8", "utf-8-sig", "cp1256", "iso-8859-6"]

    def supported_extensions(self) -> List[str]:
        return [".mARkdown"]

    def convert(self, file_path: Path):
        """
        Convert an OpenITI mARkdown file to clean text.
        
        Returns a ConversionResult (imported at registration time to avoid
        circular imports).
        """
        from .converter_registry import ConversionResult, FileFormat

        # Read file with encoding detection
        try:
            raw_bytes = file_path.read_bytes()
        except Exception as e:
            return ConversionResult(
                success=False,
                source_format=FileFormat.UNKNOWN,
                source_path=str(file_path),
                errors=["فشل قراءة الملف: {}".format(e)],
            )

        raw_text = None
        detected_encoding = ""
        for enc in self.ENCODINGS:
            try:
                raw_text = raw_bytes.decode(enc)
                detected_encoding = enc
                break
            except (UnicodeDecodeError, LookupError):
                continue

        if raw_text is None:
            return ConversionResult(
                success=False,
                source_format=FileFormat.UNKNOWN,
                source_path=str(file_path),
                errors=["فشل كشف ترميز الملف"],
            )

        # Quick validation: is this actually an OpenITI file?
        if "######OpenITI" not in raw_text[:200] and "#META#" not in raw_text[:500]:
            # Might be a plain text file with -ara1 extension
            # Treat as plain text fallback
            return ConversionResult(
                success=True,
                text=raw_text,
                source_format=FileFormat.TXT,
                source_path=str(file_path),
                encoding_detected=detected_encoding,
                warnings=["لا يحتوي رأس OpenITI — مُعامَل كنص عادي"],
            )

        # Parse OpenITI
        try:
            clean_text, metadata = parse_openiti_file(raw_text)
        except Exception as e:
            return ConversionResult(
                success=False,
                source_format=FileFormat.UNKNOWN,
                source_path=str(file_path),
                errors=["فشل تحليل OpenITI: {}".format(e)],
            )

        if not clean_text.strip():
            return ConversionResult(
                success=False,
                source_format=FileFormat.MARKDOWN,
                source_path=str(file_path),
                errors=["النص فارغ بعد التحليل"],
            )

        return ConversionResult(
            success=True,
            text=clean_text,
            source_format=FileFormat.MARKDOWN,
            source_path=str(file_path),
            encoding_detected=detected_encoding,
            metadata=metadata.to_dict(),
        )
