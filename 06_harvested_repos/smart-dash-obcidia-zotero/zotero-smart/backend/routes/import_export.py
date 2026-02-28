"""
Import/Export Routes - استيراد وتصدير المراجع
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
import json
import re
from datetime import datetime

from ..database.db import get_db
from ..models.schemas import ImportResult, ExportRequest

router = APIRouter(prefix="/io", tags=["import-export"])


def parse_bibtex(bibtex_str: str) -> List[dict]:
    """Parse BibTeX string into list of references"""
    references = []

    # Simple BibTeX parser
    entry_pattern = r'@(\w+)\{([^,]+),([^@]+)\}'
    entries = re.findall(entry_pattern, bibtex_str, re.DOTALL)

    for entry_type, citation_key, fields_str in entries:
        ref = {
            "type": map_bibtex_type(entry_type.lower()),
            "citation_key": citation_key.strip(),
            "bibtex": f"@{entry_type}{{{citation_key},{fields_str}}}",
        }

        # Parse fields
        field_pattern = r'(\w+)\s*=\s*[{"]([^}"]+)[}"]'
        fields = re.findall(field_pattern, fields_str)

        for field_name, field_value in fields:
            field_name = field_name.lower()
            field_value = field_value.strip()

            if field_name == "title":
                ref["title"] = field_value
            elif field_name == "author":
                ref["authors"] = field_value.replace(" and ", ", ")
            elif field_name == "year":
                ref["year"] = int(field_value) if field_value.isdigit() else None
            elif field_name == "publisher":
                ref["publisher"] = field_value
            elif field_name == "journal":
                ref["journal"] = field_value
            elif field_name == "volume":
                ref["volume"] = field_value
            elif field_name == "number":
                ref["issue"] = field_value
            elif field_name == "pages":
                ref["pages"] = field_value
            elif field_name == "doi":
                ref["doi"] = field_value
            elif field_name == "isbn":
                ref["isbn"] = field_value
            elif field_name == "url":
                ref["url"] = field_value
            elif field_name == "abstract":
                ref["abstract"] = field_value

        if ref.get("title"):
            references.append(ref)

    return references


def map_bibtex_type(bibtex_type: str) -> str:
    """Map BibTeX entry type to our type"""
    type_map = {
        "article": "article",
        "book": "book",
        "inbook": "chapter",
        "incollection": "chapter",
        "inproceedings": "conference",
        "conference": "conference",
        "phdthesis": "thesis",
        "mastersthesis": "thesis",
        "techreport": "report",
        "misc": "other",
        "online": "webpage",
        "manual": "report",
    }
    return type_map.get(bibtex_type, "other")


def parse_ris(ris_str: str) -> List[dict]:
    """Parse RIS string into list of references"""
    references = []
    current_ref = {}

    for line in ris_str.split('\n'):
        line = line.strip()
        if not line:
            continue

        if line.startswith("TY  - "):
            current_ref = {"type": map_ris_type(line[6:])}
        elif line.startswith("TI  - "):
            current_ref["title"] = line[6:]
        elif line.startswith("AU  - "):
            if "authors" not in current_ref:
                current_ref["authors"] = line[6:]
            else:
                current_ref["authors"] += ", " + line[6:]
        elif line.startswith("PY  - "):
            year_str = line[6:].split("/")[0]
            current_ref["year"] = int(year_str) if year_str.isdigit() else None
        elif line.startswith("PB  - "):
            current_ref["publisher"] = line[6:]
        elif line.startswith("JO  - ") or line.startswith("JF  - "):
            current_ref["journal"] = line[6:]
        elif line.startswith("VL  - "):
            current_ref["volume"] = line[6:]
        elif line.startswith("IS  - "):
            current_ref["issue"] = line[6:]
        elif line.startswith("SP  - "):
            current_ref["pages"] = line[6:]
        elif line.startswith("EP  - "):
            if "pages" in current_ref:
                current_ref["pages"] += "-" + line[6:]
        elif line.startswith("DO  - "):
            current_ref["doi"] = line[6:]
        elif line.startswith("SN  - "):
            current_ref["isbn"] = line[6:]
        elif line.startswith("UR  - "):
            current_ref["url"] = line[6:]
        elif line.startswith("AB  - "):
            current_ref["abstract"] = line[6:]
        elif line.startswith("ER  - "):
            if current_ref.get("title"):
                references.append(current_ref)
            current_ref = {}

    return references


def map_ris_type(ris_type: str) -> str:
    """Map RIS type to our type"""
    type_map = {
        "JOUR": "article",
        "BOOK": "book",
        "CHAP": "chapter",
        "CONF": "conference",
        "THES": "thesis",
        "RPRT": "report",
        "ELEC": "webpage",
        "GEN": "other",
    }
    return type_map.get(ris_type.strip(), "other")


@router.post("/import/bibtex", response_model=ImportResult)
async def import_bibtex(file: UploadFile = File(...)):
    """Import references from BibTeX file"""
    db = await get_db()
    try:
        content = await file.read()
        bibtex_str = content.decode("utf-8")
        references = parse_bibtex(bibtex_str)

        imported = 0
        failed = 0
        errors = []

        for ref in references:
            try:
                cursor = await db.execute("""
                    INSERT INTO references (
                        title, authors, year, type, publisher, journal,
                        volume, issue, pages, doi, isbn, url, abstract,
                        citation_key, bibtex
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [
                    ref.get("title"), ref.get("authors"), ref.get("year"),
                    ref.get("type", "other"), ref.get("publisher"), ref.get("journal"),
                    ref.get("volume"), ref.get("issue"), ref.get("pages"),
                    ref.get("doi"), ref.get("isbn"), ref.get("url"),
                    ref.get("abstract"), ref.get("citation_key"), ref.get("bibtex")
                ])
                imported += 1
            except Exception as e:
                failed += 1
                errors.append(f"Error importing {ref.get('title', 'unknown')}: {str(e)}")

        await db.commit()

        # Log import
        await db.execute("""
            INSERT INTO import_history (source, file_name, items_count, status)
            VALUES (?, ?, ?, ?)
        """, ["bibtex", file.filename, imported, "completed"])
        await db.commit()

        return {
            "success": True,
            "imported_count": imported,
            "failed_count": failed,
            "errors": errors
        }
    finally:
        await db.close()


@router.post("/import/ris", response_model=ImportResult)
async def import_ris(file: UploadFile = File(...)):
    """Import references from RIS file"""
    db = await get_db()
    try:
        content = await file.read()
        ris_str = content.decode("utf-8")
        references = parse_ris(ris_str)

        imported = 0
        failed = 0
        errors = []

        for ref in references:
            try:
                cursor = await db.execute("""
                    INSERT INTO references (
                        title, authors, year, type, publisher, journal,
                        volume, issue, pages, doi, isbn, url, abstract
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [
                    ref.get("title"), ref.get("authors"), ref.get("year"),
                    ref.get("type", "other"), ref.get("publisher"), ref.get("journal"),
                    ref.get("volume"), ref.get("issue"), ref.get("pages"),
                    ref.get("doi"), ref.get("isbn"), ref.get("url"),
                    ref.get("abstract")
                ])
                imported += 1
            except Exception as e:
                failed += 1
                errors.append(f"Error importing {ref.get('title', 'unknown')}: {str(e)}")

        await db.commit()

        # Log import
        await db.execute("""
            INSERT INTO import_history (source, file_name, items_count, status)
            VALUES (?, ?, ?, ?)
        """, ["ris", file.filename, imported, "completed"])
        await db.commit()

        return {
            "success": True,
            "imported_count": imported,
            "failed_count": failed,
            "errors": errors
        }
    finally:
        await db.close()


@router.post("/import/json", response_model=ImportResult)
async def import_json(file: UploadFile = File(...)):
    """Import references from JSON file"""
    db = await get_db()
    try:
        content = await file.read()
        data = json.loads(content.decode("utf-8"))

        if isinstance(data, dict) and "references" in data:
            references = data["references"]
        elif isinstance(data, list):
            references = data
        else:
            raise HTTPException(status_code=400, detail="Invalid JSON format")

        imported = 0
        failed = 0
        errors = []

        for ref in references:
            try:
                cursor = await db.execute("""
                    INSERT INTO references (
                        title, title_ar, authors, authors_ar, year, hijri_year,
                        type, publisher, journal, volume, issue, pages,
                        doi, isbn, url, abstract, abstract_ar, language
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [
                    ref.get("title"), ref.get("title_ar"), ref.get("authors"),
                    ref.get("authors_ar"), ref.get("year"), ref.get("hijri_year"),
                    ref.get("type", "other"), ref.get("publisher"), ref.get("journal"),
                    ref.get("volume"), ref.get("issue"), ref.get("pages"),
                    ref.get("doi"), ref.get("isbn"), ref.get("url"),
                    ref.get("abstract"), ref.get("abstract_ar"),
                    ref.get("language", "ar")
                ])
                imported += 1
            except Exception as e:
                failed += 1
                errors.append(f"Error importing {ref.get('title', 'unknown')}: {str(e)}")

        await db.commit()

        # Log import
        await db.execute("""
            INSERT INTO import_history (source, file_name, items_count, status)
            VALUES (?, ?, ?, ?)
        """, ["json", file.filename, imported, "completed"])
        await db.commit()

        return {
            "success": True,
            "imported_count": imported,
            "failed_count": failed,
            "errors": errors
        }
    finally:
        await db.close()


@router.post("/export/bibtex")
async def export_bibtex(request: ExportRequest):
    """Export references to BibTeX format"""
    db = await get_db()
    try:
        placeholders = ",".join(["?" for _ in request.reference_ids])
        cursor = await db.execute(
            f"SELECT * FROM references WHERE id IN ({placeholders})",
            request.reference_ids
        )
        rows = await cursor.fetchall()

        bibtex_entries = []
        for row in rows:
            ref = dict(row)
            if ref.get("bibtex"):
                bibtex_entries.append(ref["bibtex"])
            else:
                # Generate BibTeX
                entry_type = ref.get("type", "misc")
                citation_key = ref.get("citation_key") or f"ref{ref['id']}"

                entry = f"@{entry_type}{{{citation_key},\n"
                if ref.get("title"):
                    entry += f'  title = {{{ref["title"]}}},\n'
                if ref.get("authors"):
                    entry += f'  author = {{{ref["authors"]}}},\n'
                if ref.get("year"):
                    entry += f'  year = {{{ref["year"]}}},\n'
                if ref.get("publisher"):
                    entry += f'  publisher = {{{ref["publisher"]}}},\n'
                if ref.get("journal"):
                    entry += f'  journal = {{{ref["journal"]}}},\n'
                if ref.get("volume"):
                    entry += f'  volume = {{{ref["volume"]}}},\n'
                if ref.get("pages"):
                    entry += f'  pages = {{{ref["pages"]}}},\n'
                if ref.get("doi"):
                    entry += f'  doi = {{{ref["doi"]}}},\n'
                entry += "}"
                bibtex_entries.append(entry)

        return {"bibtex": "\n\n".join(bibtex_entries)}
    finally:
        await db.close()


@router.post("/export/json")
async def export_json(request: ExportRequest):
    """Export references to JSON format"""
    db = await get_db()
    try:
        placeholders = ",".join(["?" for _ in request.reference_ids])
        cursor = await db.execute(
            f"SELECT * FROM references WHERE id IN ({placeholders})",
            request.reference_ids
        )
        rows = await cursor.fetchall()

        references = []
        for row in rows:
            ref = dict(row)
            # Remove internal fields
            ref.pop("bibtex", None)
            ref.pop("zotero_key", None)
            references.append(ref)

        return {"references": references}
    finally:
        await db.close()


@router.get("/import/history")
async def get_import_history(limit: int = 20):
    """Get import history"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT * FROM import_history
            ORDER BY created_at DESC
            LIMIT ?
        """, [limit])
        return [dict(row) for row in await cursor.fetchall()]
    finally:
        await db.close()
