"""
Search Routes - مسارات البحث
"""

from fastapi import APIRouter, Query
from typing import List, Optional
from datetime import datetime

from database.db import get_db
from models.schemas import SearchQuery, SearchResponse, SearchResult, SearchStats

router = APIRouter(prefix="/search", tags=["Search"])


@router.post("/", response_model=SearchResponse)
async def search(query: SearchQuery):
    """Full-text search across notes, questions, and quotations"""
    db = await get_db()
    try:
        results = []

        # Search in notes using FTS5
        if "notes" in query.search_in:
            note_query = """
                SELECT n.id, n.title, n.content, n.created_at,
                       bm25(notes_fts) as score
                FROM notes_fts
                JOIN notes n ON notes_fts.rowid = n.id
                WHERE notes_fts MATCH ?
            """
            params = [query.q]

            if query.project_id:
                note_query += " AND n.project_id = ?"
                params.append(query.project_id)

            if query.date_from:
                note_query += " AND n.created_at >= ?"
                params.append(query.date_from)

            if query.date_to:
                note_query += " AND n.created_at <= ?"
                params.append(query.date_to)

            note_query += " ORDER BY score LIMIT ?"
            params.append(query.limit)

            cursor = await db.execute(note_query, params)
            notes = await cursor.fetchall()

            for note in notes:
                # Get tags
                cursor = await db.execute("""
                    SELECT t.name FROM tags t
                    JOIN note_tags nt ON t.id = nt.tag_id
                    WHERE nt.note_id = ?
                """, (note["id"],))
                tags = await cursor.fetchall()

                # Filter by tags if specified
                note_tags = [t["name"] for t in tags]
                if query.tags and not any(t in note_tags for t in query.tags):
                    continue

                results.append(SearchResult(
                    type="note",
                    id=note["id"],
                    title=note["title"],
                    content_preview=note["content"][:200] + "..." if len(note["content"]) > 200 else note["content"],
                    relevance_score=abs(note["score"]) if note["score"] else 0,
                    created_at=note["created_at"],
                    tags=note_tags
                ))

        # Search in questions
        if "questions" in query.search_in:
            question_query = """
                SELECT q.id, q.content, q.created_at, q.project_id
                FROM questions q
                WHERE q.content LIKE ?
            """
            params = [f"%{query.q}%"]

            if query.project_id:
                question_query += " AND q.project_id = ?"
                params.append(query.project_id)

            question_query += " LIMIT ?"
            params.append(query.limit)

            cursor = await db.execute(question_query, params)
            questions = await cursor.fetchall()

            for q in questions:
                results.append(SearchResult(
                    type="question",
                    id=q["id"],
                    title=q["content"][:100],
                    content_preview=q["content"],
                    relevance_score=0.5,
                    created_at=q["created_at"],
                    tags=[]
                ))

        # Search in quotations
        if "quotations" in query.search_in:
            quote_query = """
                SELECT q.id, q.content, q.source_title, q.created_at, q.tags
                FROM quotations q
                WHERE q.content LIKE ?
            """
            params = [f"%{query.q}%"]

            quote_query += " LIMIT ?"
            params.append(query.limit)

            cursor = await db.execute(quote_query, params)
            quotations = await cursor.fetchall()

            for q in quotations:
                tags = q["tags"].split(",") if q["tags"] else []
                results.append(SearchResult(
                    type="quotation",
                    id=q["id"],
                    title=q["source_title"] or "اقتباس",
                    content_preview=q["content"][:200] + "..." if len(q["content"]) > 200 else q["content"],
                    relevance_score=0.4,
                    created_at=q["created_at"],
                    tags=tags
                ))

        # Sort by relevance score
        results.sort(key=lambda x: x.relevance_score, reverse=True)

        return SearchResponse(
            results=results[:query.limit],
            total_count=len(results),
            query=query.q
        )
    finally:
        await db.close()


@router.get("/suggestions")
async def get_search_suggestions(q: str = Query(..., min_length=1)):
    """Get search suggestions based on partial query"""
    db = await get_db()
    try:
        suggestions = []

        # Search in note titles
        cursor = await db.execute("""
            SELECT DISTINCT title FROM notes
            WHERE title LIKE ?
            LIMIT 5
        """, (f"%{q}%",))
        titles = await cursor.fetchall()
        suggestions.extend([{"type": "note", "text": t["title"]} for t in titles])

        # Search in tags
        cursor = await db.execute("""
            SELECT name FROM tags
            WHERE name LIKE ?
            ORDER BY usage_count DESC
            LIMIT 5
        """, (f"%{q}%",))
        tags = await cursor.fetchall()
        suggestions.extend([{"type": "tag", "text": f"#{t['name']}"} for t in tags])

        # Search in project names
        cursor = await db.execute("""
            SELECT name FROM projects
            WHERE name LIKE ?
            LIMIT 3
        """, (f"%{q}%",))
        projects = await cursor.fetchall()
        suggestions.extend([{"type": "project", "text": p["name"]} for p in projects])

        return suggestions[:10]
    finally:
        await db.close()


@router.get("/stats", response_model=SearchStats)
async def get_search_stats():
    """Get overall statistics"""
    db = await get_db()
    try:
        stats = SearchStats()

        cursor = await db.execute("SELECT COUNT(*) as count FROM notes WHERE is_archived = 0")
        stats.total_notes = (await cursor.fetchone())["count"]

        cursor = await db.execute("SELECT COUNT(*) as count FROM tags")
        stats.total_tags = (await cursor.fetchone())["count"]

        cursor = await db.execute("SELECT COUNT(*) as count FROM projects")
        stats.total_projects = (await cursor.fetchone())["count"]

        cursor = await db.execute("SELECT COUNT(*) as count FROM links")
        stats.total_links = (await cursor.fetchone())["count"]

        cursor = await db.execute("SELECT COUNT(*) as count FROM questions WHERE status = 'open'")
        stats.total_questions = (await cursor.fetchone())["count"]

        cursor = await db.execute("SELECT COUNT(*) as count FROM quotations")
        stats.total_quotations = (await cursor.fetchone())["count"]

        return stats
    finally:
        await db.close()
