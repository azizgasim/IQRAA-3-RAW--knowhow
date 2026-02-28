"""
Search Routes - البحث المتقدم
"""

from fastapi import APIRouter, Query
from typing import List, Optional

from ..database.db import get_db
from ..models.schemas import SearchRequest, SearchResult, ReferenceType, ReadStatus

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=List[SearchResult])
async def search_references(
    q: str = Query(..., min_length=2),
    type: Optional[ReferenceType] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
    language: Optional[str] = None,
    tag: Optional[str] = None,
    collection_id: Optional[int] = None,
    read_status: Optional[ReadStatus] = None,
    limit: int = Query(default=50, le=200),
    offset: int = 0
):
    """Full-text search across references"""
    db = await get_db()
    try:
        # Build FTS query
        query = """
            SELECT r.id, r.title, r.title_ar, r.authors, r.year, r.type,
                   bm25(references_fts) as relevance_score
            FROM references_fts
            JOIN references r ON references_fts.rowid = r.id
        """

        conditions = ["references_fts MATCH ?"]
        params = [q]

        if type:
            conditions.append("r.type = ?")
            params.append(type.value)

        if year_from:
            conditions.append("r.year >= ?")
            params.append(year_from)

        if year_to:
            conditions.append("r.year <= ?")
            params.append(year_to)

        if language:
            conditions.append("r.language = ?")
            params.append(language)

        if read_status:
            conditions.append("r.read_status = ?")
            params.append(read_status.value)

        if tag:
            query = query.replace(
                "FROM references_fts",
                """FROM references_fts
                   JOIN reference_tags rt ON r.id = rt.reference_id
                   JOIN tags t ON rt.tag_id = t.id"""
            )
            conditions.append("t.name = ?")
            params.append(tag)

        if collection_id:
            query = query.replace(
                "FROM references_fts",
                """FROM references_fts
                   JOIN reference_collections rc ON r.id = rc.reference_id"""
            )
            conditions.append("rc.collection_id = ?")
            params.append(collection_id)

        query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY relevance_score LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()

        return [dict(row) for row in rows]
    finally:
        await db.close()


@router.post("/advanced", response_model=List[SearchResult])
async def advanced_search(request: SearchRequest):
    """Advanced search with more options"""
    db = await get_db()
    try:
        query = """
            SELECT r.id, r.title, r.title_ar, r.authors, r.year, r.type, 0 as relevance_score
            FROM references r
        """
        conditions = ["1=1"]
        params = []

        # Text search (if query provided)
        if request.query:
            query = """
                SELECT r.id, r.title, r.title_ar, r.authors, r.year, r.type,
                       bm25(references_fts) as relevance_score
                FROM references_fts
                JOIN references r ON references_fts.rowid = r.id
            """
            conditions = ["references_fts MATCH ?"]
            params = [request.query]

        if request.type:
            conditions.append("r.type = ?")
            params.append(request.type.value)

        if request.year_from:
            conditions.append("r.year >= ?")
            params.append(request.year_from)

        if request.year_to:
            conditions.append("r.year <= ?")
            params.append(request.year_to)

        if request.language:
            conditions.append("r.language = ?")
            params.append(request.language)

        if request.read_status:
            conditions.append("r.read_status = ?")
            params.append(request.read_status.value)

        if request.tags:
            placeholders = ",".join(["?" for _ in request.tags])
            query = query.replace(
                "FROM references r",
                f"""FROM references r
                   JOIN reference_tags rt ON r.id = rt.reference_id
                   JOIN tags t ON rt.tag_id = t.id"""
            )
            conditions.append(f"t.name IN ({placeholders})")
            params.extend(request.tags)

        if request.collection_id:
            query = query.replace(
                "FROM references r",
                """FROM references r
                   JOIN reference_collections rc ON r.id = rc.reference_id"""
            )
            conditions.append("rc.collection_id = ?")
            params.append(request.collection_id)

        query += " WHERE " + " AND ".join(conditions)

        if request.query:
            query += " ORDER BY relevance_score"
        else:
            query += " ORDER BY r.updated_at DESC"

        query += " LIMIT ? OFFSET ?"
        params.extend([request.limit, request.offset])

        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()

        return [dict(row) for row in rows]
    finally:
        await db.close()


@router.get("/suggestions")
async def get_suggestions(q: str = Query(..., min_length=1), limit: int = 10):
    """Get search suggestions based on partial input"""
    db = await get_db()
    try:
        results = []

        # Search titles
        cursor = await db.execute("""
            SELECT DISTINCT title as text, 'title' as type
            FROM references
            WHERE title LIKE ? OR title_ar LIKE ?
            LIMIT ?
        """, [f"%{q}%", f"%{q}%", limit])
        rows = await cursor.fetchall()
        results.extend([dict(row) for row in rows])

        # Search authors
        cursor = await db.execute("""
            SELECT DISTINCT authors as text, 'author' as type
            FROM references
            WHERE authors LIKE ? OR authors_ar LIKE ?
            LIMIT ?
        """, [f"%{q}%", f"%{q}%", limit])
        rows = await cursor.fetchall()
        results.extend([dict(row) for row in rows])

        # Search tags
        cursor = await db.execute("""
            SELECT DISTINCT name as text, 'tag' as type
            FROM tags
            WHERE name LIKE ?
            LIMIT ?
        """, [f"%{q}%", limit])
        rows = await cursor.fetchall()
        results.extend([dict(row) for row in rows])

        return results[:limit]
    finally:
        await db.close()


@router.get("/recent")
async def get_recent_searches(limit: int = 10):
    """Get recently viewed references"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT id, title, title_ar, authors, year, type
            FROM references
            ORDER BY updated_at DESC
            LIMIT ?
        """, [limit])
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()
