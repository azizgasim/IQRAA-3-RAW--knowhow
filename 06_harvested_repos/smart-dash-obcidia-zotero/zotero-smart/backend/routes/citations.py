"""
Citations Routes - تنسيق الاقتباسات
"""

from fastapi import APIRouter, HTTPException
from typing import List

from ..database.db import get_db
from ..models.schemas import CitationStyle, CitationRequest, CitationResponse

router = APIRouter(prefix="/citations", tags=["citations"])


def format_apa(ref: dict) -> str:
    """Format citation in APA style"""
    authors = ref.get("authors", "")
    year = ref.get("year", "n.d.")
    title = ref.get("title", "")
    publisher = ref.get("publisher", "")
    journal = ref.get("journal", "")
    volume = ref.get("volume", "")
    issue = ref.get("issue", "")
    pages = ref.get("pages", "")
    doi = ref.get("doi", "")

    if ref.get("type") == "article" and journal:
        citation = f"{authors} ({year}). {title}. {journal}"
        if volume:
            citation += f", {volume}"
            if issue:
                citation += f"({issue})"
        if pages:
            citation += f", {pages}"
        citation += "."
        if doi:
            citation += f" https://doi.org/{doi}"
    else:
        citation = f"{authors} ({year}). {title}."
        if publisher:
            citation += f" {publisher}."

    return citation


def format_mla(ref: dict) -> str:
    """Format citation in MLA style"""
    authors = ref.get("authors", "")
    title = ref.get("title", "")
    publisher = ref.get("publisher", "")
    year = ref.get("year", "")
    journal = ref.get("journal", "")

    if ref.get("type") == "article" and journal:
        citation = f'{authors}. "{title}." {journal}'
        if year:
            citation += f", {year}"
        citation += "."
    else:
        citation = f"{authors}. {title}."
        if publisher:
            citation += f" {publisher}"
        if year:
            citation += f", {year}"
        citation += "."

    return citation


def format_chicago(ref: dict) -> str:
    """Format citation in Chicago style"""
    authors = ref.get("authors", "")
    title = ref.get("title", "")
    publisher = ref.get("publisher", "")
    year = ref.get("year", "")
    journal = ref.get("journal", "")
    volume = ref.get("volume", "")
    pages = ref.get("pages", "")

    if ref.get("type") == "article" and journal:
        citation = f'{authors}. "{title}." {journal}'
        if volume:
            citation += f" {volume}"
        if year:
            citation += f" ({year})"
        if pages:
            citation += f": {pages}"
        citation += "."
    else:
        citation = f"{authors}. {title}."
        if publisher:
            citation += f" {publisher}"
        if year:
            citation += f", {year}"
        citation += "."

    return citation


def format_arabic_chicago(ref: dict) -> str:
    """Format citation in Arabic Chicago style"""
    authors = ref.get("authors_ar") or ref.get("authors", "")
    title = ref.get("title_ar") or ref.get("title", "")
    publisher = ref.get("publisher", "")
    year = ref.get("hijri_year") or ref.get("year", "")

    citation = f"{authors}. {title}."
    if publisher:
        citation += f" {publisher}"
    if year:
        citation += f"، {year}"
    citation += "."

    return citation


def format_harvard(ref: dict) -> str:
    """Format citation in Harvard style"""
    authors = ref.get("authors", "")
    year = ref.get("year", "n.d.")
    title = ref.get("title", "")
    publisher = ref.get("publisher", "")
    journal = ref.get("journal", "")
    volume = ref.get("volume", "")
    pages = ref.get("pages", "")

    if ref.get("type") == "article" and journal:
        citation = f"{authors} ({year}) '{title}', {journal}"
        if volume:
            citation += f", vol. {volume}"
        if pages:
            citation += f", pp. {pages}"
        citation += "."
    else:
        citation = f"{authors} ({year}) {title}."
        if publisher:
            citation += f" {publisher}."

    return citation


def format_ieee(ref: dict) -> str:
    """Format citation in IEEE style"""
    authors = ref.get("authors", "")
    title = ref.get("title", "")
    publisher = ref.get("publisher", "")
    year = ref.get("year", "")
    journal = ref.get("journal", "")
    volume = ref.get("volume", "")
    pages = ref.get("pages", "")

    if ref.get("type") == "article" and journal:
        citation = f'{authors}, "{title}," {journal}'
        if volume:
            citation += f", vol. {volume}"
        if pages:
            citation += f", pp. {pages}"
        if year:
            citation += f", {year}"
        citation += "."
    else:
        citation = f'{authors}, "{title}."'
        if publisher:
            citation += f" {publisher}"
        if year:
            citation += f", {year}"
        citation += "."

    return citation


def format_vancouver(ref: dict) -> str:
    """Format citation in Vancouver style"""
    authors = ref.get("authors", "")
    title = ref.get("title", "")
    publisher = ref.get("publisher", "")
    year = ref.get("year", "")
    journal = ref.get("journal", "")
    volume = ref.get("volume", "")
    pages = ref.get("pages", "")

    if ref.get("type") == "article" and journal:
        citation = f"{authors}. {title}. {journal}. {year}"
        if volume:
            citation += f";{volume}"
        if pages:
            citation += f":{pages}"
        citation += "."
    else:
        citation = f"{authors}. {title}."
        if publisher:
            citation += f" {publisher}"
        if year:
            citation += f"; {year}"
        citation += "."

    return citation


FORMATTERS = {
    CitationStyle.APA: format_apa,
    CitationStyle.MLA: format_mla,
    CitationStyle.CHICAGO: format_chicago,
    CitationStyle.HARVARD: format_harvard,
    CitationStyle.IEEE: format_ieee,
    CitationStyle.VANCOUVER: format_vancouver,
    CitationStyle.ARABIC_CHICAGO: format_arabic_chicago,
}


@router.post("/format", response_model=CitationResponse)
async def format_citation(request: CitationRequest):
    """Format a citation in specified style"""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM references WHERE id = ?",
            [request.reference_id]
        )
        row = await cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Reference not found")

        ref = dict(row)
        formatter = FORMATTERS.get(request.style, format_apa)
        formatted = formatter(ref)

        # Save citation
        cursor = await db.execute("""
            INSERT INTO citations (reference_id, style, formatted_citation)
            VALUES (?, ?, ?)
        """, [request.reference_id, request.style.value, formatted])
        await db.commit()

        return {
            "id": cursor.lastrowid,
            "reference_id": request.reference_id,
            "style": request.style.value,
            "formatted_citation": formatted,
            "created_at": "now"
        }
    finally:
        await db.close()


@router.get("/formats")
async def get_available_formats():
    """Get list of available citation formats"""
    return [
        {"id": "apa", "name": "APA (7th Edition)", "example": "Author (Year). Title. Publisher."},
        {"id": "mla", "name": "MLA (9th Edition)", "example": 'Author. "Title." Publisher, Year.'},
        {"id": "chicago", "name": "Chicago", "example": "Author. Title. Publisher, Year."},
        {"id": "harvard", "name": "Harvard", "example": "Author (Year) Title. Publisher."},
        {"id": "ieee", "name": "IEEE", "example": 'Author, "Title," Publisher, Year.'},
        {"id": "vancouver", "name": "Vancouver", "example": "Author. Title. Publisher; Year."},
        {"id": "arabic-chicago", "name": "شيكاغو العربي", "example": "المؤلف. العنوان. الناشر، السنة."},
    ]


@router.post("/batch")
async def format_batch_citations(reference_ids: List[int], style: CitationStyle):
    """Format multiple citations at once"""
    db = await get_db()
    try:
        results = []
        formatter = FORMATTERS.get(style, format_apa)

        for ref_id in reference_ids:
            cursor = await db.execute(
                "SELECT * FROM references WHERE id = ?",
                [ref_id]
            )
            row = await cursor.fetchone()
            if row:
                ref = dict(row)
                formatted = formatter(ref)
                results.append({
                    "reference_id": ref_id,
                    "formatted_citation": formatted
                })

        return results
    finally:
        await db.close()


@router.get("/reference/{reference_id}")
async def get_all_citation_formats(reference_id: int):
    """Get citation in all available formats"""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM references WHERE id = ?",
            [reference_id]
        )
        row = await cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Reference not found")

        ref = dict(row)
        results = {}

        for style, formatter in FORMATTERS.items():
            results[style.value] = formatter(ref)

        return results
    finally:
        await db.close()
