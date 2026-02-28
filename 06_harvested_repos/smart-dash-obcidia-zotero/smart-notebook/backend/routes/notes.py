"""
Notes Routes - مسارات الملاحظات
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import re
from datetime import datetime, timedelta

from database.db import get_db
from models.schemas import (
    NoteCreate, NoteUpdate, NoteResponse, LinkResponse
)

router = APIRouter(prefix="/notes", tags=["Notes"])


# ===== Helper Functions =====

def extract_wiki_links(content: str) -> List[str]:
    """Extract [[wiki-style]] links from content"""
    pattern = r'\[\[([^\]]+)\]\]'
    return re.findall(pattern, content)


async def update_note_links(db, note_id: int, content: str):
    """Update links for a note based on its content"""
    # Delete existing links
    await db.execute("DELETE FROM links WHERE source_note_id = ?", (note_id,))

    # Extract and create new links
    link_titles = extract_wiki_links(content)
    for title in link_titles:
        # Try to find target note
        cursor = await db.execute(
            "SELECT id FROM notes WHERE title = ?", (title,)
        )
        target = await cursor.fetchone()
        target_id = target["id"] if target else None

        await db.execute(
            """INSERT INTO links (source_note_id, target_note_id, target_title)
               VALUES (?, ?, ?)""",
            (note_id, target_id, title)
        )


async def get_note_with_counts(db, note_id: int) -> Optional[dict]:
    """Get note with tag and link counts"""
    cursor = await db.execute("""
        SELECT n.*,
               (SELECT COUNT(*) FROM links WHERE source_note_id = n.id) as links_count,
               (SELECT COUNT(*) FROM links WHERE target_note_id = n.id) as backlinks_count
        FROM notes n WHERE n.id = ?
    """, (note_id,))
    row = await cursor.fetchone()
    if not row:
        return None

    note = dict(row)

    # Get tags
    cursor = await db.execute("""
        SELECT t.name FROM tags t
        JOIN note_tags nt ON t.id = nt.tag_id
        WHERE nt.note_id = ?
    """, (note_id,))
    tags = await cursor.fetchall()
    note["tags"] = [t["name"] for t in tags]

    return note


# ===== Endpoints =====

@router.get("/", response_model=List[NoteResponse])
async def get_notes(
    project_id: Optional[int] = None,
    tag: Optional[str] = None,
    source: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    is_archived: Optional[bool] = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """Get all notes with optional filters"""
    db = await get_db()
    try:
        query = """
            SELECT n.*,
                   (SELECT COUNT(*) FROM links WHERE source_note_id = n.id) as links_count,
                   (SELECT COUNT(*) FROM links WHERE target_note_id = n.id) as backlinks_count
            FROM notes n
            WHERE 1=1
        """
        params = []

        if project_id:
            query += " AND n.project_id = ?"
            params.append(project_id)
        if source:
            query += " AND n.source = ?"
            params.append(source)
        if is_favorite is not None:
            query += " AND n.is_favorite = ?"
            params.append(1 if is_favorite else 0)
        if is_archived is not None:
            query += " AND n.is_archived = ?"
            params.append(1 if is_archived else 0)
        else:
            query += " AND n.is_archived = 0"

        if tag:
            query += """ AND n.id IN (
                SELECT nt.note_id FROM note_tags nt
                JOIN tags t ON nt.tag_id = t.id
                WHERE t.name = ?
            )"""
            params.append(tag)

        query += " ORDER BY n.updated_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor = await db.execute(query, params)
        notes = await cursor.fetchall()

        result = []
        for note in notes:
            note_dict = dict(note)
            # Get tags
            cursor = await db.execute("""
                SELECT t.name FROM tags t
                JOIN note_tags nt ON t.id = nt.tag_id
                WHERE nt.note_id = ?
            """, (note_dict["id"],))
            tags = await cursor.fetchall()
            note_dict["tags"] = [t["name"] for t in tags]
            result.append(note_dict)

        return result
    finally:
        await db.close()


@router.get("/reviews/due", response_model=List[NoteResponse])
async def get_due_reviews():
    """Get notes due for spaced repetition review"""
    db = await get_db()
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        cursor = await db.execute("""
            SELECT n.*,
                   (SELECT COUNT(*) FROM links WHERE source_note_id = n.id) as links_count,
                   (SELECT COUNT(*) FROM links WHERE target_note_id = n.id) as backlinks_count
            FROM notes n
            WHERE n.next_review_date <= ? AND n.is_archived = 0
            ORDER BY n.next_review_date ASC
            LIMIT 20
        """, (today,))
        notes = await cursor.fetchall()

        result = []
        for note in notes:
            note_dict = dict(note)
            cursor = await db.execute("""
                SELECT t.name FROM tags t
                JOIN note_tags nt ON t.id = nt.tag_id
                WHERE nt.note_id = ?
            """, (note_dict["id"],))
            tags = await cursor.fetchall()
            note_dict["tags"] = [t["name"] for t in tags]
            result.append(note_dict)

        return result
    finally:
        await db.close()


@router.get("/orphans/", response_model=List[NoteResponse])
async def get_orphan_notes():
    """Get notes without any links (orphans)"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT n.*,
                   0 as links_count, 0 as backlinks_count
            FROM notes n
            WHERE n.id NOT IN (
                SELECT DISTINCT source_note_id FROM links
                UNION
                SELECT DISTINCT target_note_id FROM links WHERE target_note_id IS NOT NULL
            )
            AND n.is_archived = 0
            ORDER BY n.created_at DESC
        """)
        notes = await cursor.fetchall()

        result = []
        for note in notes:
            note_dict = dict(note)
            cursor = await db.execute("""
                SELECT t.name FROM tags t
                JOIN note_tags nt ON t.id = nt.tag_id
                WHERE nt.note_id = ?
            """, (note_dict["id"],))
            tags = await cursor.fetchall()
            note_dict["tags"] = [t["name"] for t in tags]
            result.append(note_dict)

        return result
    finally:
        await db.close()


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(note_id: int):
    """Get a specific note"""
    db = await get_db()
    try:
        note = await get_note_with_counts(db, note_id)
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        return note
    finally:
        await db.close()


@router.post("/", response_model=NoteResponse)
async def create_note(note: NoteCreate):
    """Create a new note"""
    db = await get_db()
    try:
        now = datetime.now().isoformat()

        # Calculate first review date (1 day from now)
        next_review = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

        cursor = await db.execute(
            """INSERT INTO notes (title, content, source, source_ref, project_id, next_review_date, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (note.title, note.content, note.source, note.source_ref, note.project_id, next_review, now, now)
        )
        note_id = cursor.lastrowid

        # Handle tags
        for tag_name in note.tags:
            # Get or create tag
            cursor = await db.execute("SELECT id FROM tags WHERE name = ?", (tag_name,))
            tag = await cursor.fetchone()
            if tag:
                tag_id = tag["id"]
                await db.execute("UPDATE tags SET usage_count = usage_count + 1 WHERE id = ?", (tag_id,))
            else:
                cursor = await db.execute(
                    "INSERT INTO tags (name, created_at) VALUES (?, ?)", (tag_name, now)
                )
                tag_id = cursor.lastrowid

            await db.execute(
                "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)", (note_id, tag_id)
            )

        # Update links
        await update_note_links(db, note_id, note.content)

        # Update cognitive profile
        today = datetime.now().strftime("%Y-%m-%d")
        await db.execute("""
            INSERT INTO cognitive_profile (date, notes_created, links_created)
            VALUES (?, 1, ?)
            ON CONFLICT(date) DO UPDATE SET
                notes_created = notes_created + 1,
                links_created = links_created + ?
        """, (today, len(extract_wiki_links(note.content)), len(extract_wiki_links(note.content))))

        await db.commit()

        return await get_note_with_counts(db, note_id)
    finally:
        await db.close()


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: int, note: NoteUpdate):
    """Update an existing note"""
    db = await get_db()
    try:
        # Check if note exists
        cursor = await db.execute("SELECT id FROM notes WHERE id = ?", (note_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Note not found")

        now = datetime.now().isoformat()
        updates = ["updated_at = ?"]
        params = [now]

        if note.title is not None:
            updates.append("title = ?")
            params.append(note.title)
        if note.content is not None:
            updates.append("content = ?")
            params.append(note.content)
        if note.project_id is not None:
            updates.append("project_id = ?")
            params.append(note.project_id)
        if note.is_favorite is not None:
            updates.append("is_favorite = ?")
            params.append(1 if note.is_favorite else 0)
        if note.is_archived is not None:
            updates.append("is_archived = ?")
            params.append(1 if note.is_archived else 0)

        params.append(note_id)
        await db.execute(
            f"UPDATE notes SET {', '.join(updates)} WHERE id = ?",
            params
        )

        # Handle tags if provided
        if note.tags is not None:
            # Remove existing tags
            await db.execute("DELETE FROM note_tags WHERE note_id = ?", (note_id,))

            # Add new tags
            for tag_name in note.tags:
                cursor = await db.execute("SELECT id FROM tags WHERE name = ?", (tag_name,))
                tag = await cursor.fetchone()
                if tag:
                    tag_id = tag["id"]
                else:
                    cursor = await db.execute(
                        "INSERT INTO tags (name, created_at) VALUES (?, ?)", (tag_name, now)
                    )
                    tag_id = cursor.lastrowid

                await db.execute(
                    "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)", (note_id, tag_id)
                )

        # Update links if content changed
        if note.content is not None:
            await update_note_links(db, note_id, note.content)

        # Update cognitive profile
        today = datetime.now().strftime("%Y-%m-%d")
        await db.execute("""
            INSERT INTO cognitive_profile (date, notes_edited)
            VALUES (?, 1)
            ON CONFLICT(date) DO UPDATE SET notes_edited = notes_edited + 1
        """, (today,))

        await db.commit()

        return await get_note_with_counts(db, note_id)
    finally:
        await db.close()


@router.delete("/{note_id}")
async def delete_note(note_id: int):
    """Delete a note"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM notes WHERE id = ?", (note_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Note not found")

        await db.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        await db.commit()

        return {"message": "Note deleted successfully"}
    finally:
        await db.close()


@router.post("/{note_id}/review")
async def mark_note_reviewed(note_id: int):
    """Mark a note as reviewed (spaced repetition)"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT review_count FROM notes WHERE id = ?", (note_id,))
        note = await cursor.fetchone()
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")

        # Calculate next review date based on review count
        # Spaced repetition intervals: 1, 3, 7, 14, 30, 90 days
        intervals = [1, 3, 7, 14, 30, 90]
        review_count = note["review_count"]
        interval_index = min(review_count, len(intervals) - 1)
        next_review = datetime.now() + timedelta(days=intervals[interval_index])

        await db.execute(
            """UPDATE notes SET review_count = review_count + 1,
               next_review_date = ?, updated_at = ?
               WHERE id = ?""",
            (next_review.strftime("%Y-%m-%d"), datetime.now().isoformat(), note_id)
        )
        await db.commit()

        return {"message": "Review recorded", "next_review_date": next_review.strftime("%Y-%m-%d")}
    finally:
        await db.close()


@router.get("/{note_id}/links", response_model=List[LinkResponse])
async def get_note_links(note_id: int):
    """Get outgoing links from a note"""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM links WHERE source_note_id = ?", (note_id,)
        )
        links = await cursor.fetchall()
        return [dict(link) for link in links]
    finally:
        await db.close()


@router.get("/{note_id}/backlinks", response_model=List[LinkResponse])
async def get_note_backlinks(note_id: int):
    """Get incoming links to a note"""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM links WHERE target_note_id = ?", (note_id,)
        )
        links = await cursor.fetchall()
        return [dict(link) for link in links]
    finally:
        await db.close()
