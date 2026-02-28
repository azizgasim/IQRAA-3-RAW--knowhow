"""
References Routes - إدارة المراجع
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import re

from ..database.db import get_db
from ..models.schemas import (
    ReferenceCreate, ReferenceUpdate, ReferenceResponse,
    ReferenceType, ReadStatus
)

router = APIRouter(prefix="/references", tags=["references"])


def generate_citation_key(title: str, authors: str, year: int) -> str:
    """Generate a unique citation key"""
    first_author = authors.split(",")[0].split()[-1] if authors else "Unknown"
    first_author = re.sub(r'[^\w]', '', first_author)
    title_word = re.sub(r'[^\w]', '', title.split()[0]) if title else "Untitled"
    return f"{first_author}{year or 'nd'}{title_word}".lower()


@router.get("", response_model=List[ReferenceResponse])
async def get_references(
    collection_id: Optional[int] = None,
    tag: Optional[str] = None,
    type: Optional[ReferenceType] = None,
    read_status: Optional[ReadStatus] = None,
    language: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    is_archived: bool = False,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
    sort_by: str = "updated_at",
    sort_order: str = "desc",
    limit: int = Query(default=50, le=200),
    offset: int = 0
):
    """Get all references with filters"""
    db = await get_db()
    try:
        query = """
            SELECT DISTINCT r.*,
                (SELECT COUNT(*) FROM annotations WHERE reference_id = r.id) as annotations_count,
                (SELECT COUNT(*) FROM notes WHERE reference_id = r.id) as notes_count
            FROM references r
        """
        conditions = ["r.is_archived = ?"]
        params = [is_archived]

        if collection_id:
            query += " JOIN reference_collections rc ON r.id = rc.reference_id"
            conditions.append("rc.collection_id = ?")
            params.append(collection_id)

        if tag:
            query += """
                JOIN reference_tags rt ON r.id = rt.reference_id
                JOIN tags t ON rt.tag_id = t.id
            """
            conditions.append("t.name = ?")
            params.append(tag)

        if type:
            conditions.append("r.type = ?")
            params.append(type.value)

        if read_status:
            conditions.append("r.read_status = ?")
            params.append(read_status.value)

        if language:
            conditions.append("r.language = ?")
            params.append(language)

        if is_favorite is not None:
            conditions.append("r.is_favorite = ?")
            params.append(is_favorite)

        if year_from:
            conditions.append("r.year >= ?")
            params.append(year_from)

        if year_to:
            conditions.append("r.year <= ?")
            params.append(year_to)

        query += " WHERE " + " AND ".join(conditions)

        # Sorting
        valid_sort_fields = ["updated_at", "created_at", "title", "year", "authors"]
        if sort_by in valid_sort_fields:
            query += f" ORDER BY r.{sort_by} {sort_order.upper()}"
        else:
            query += " ORDER BY r.updated_at DESC"

        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()

        references = []
        for row in rows:
            ref = dict(row)

            # Get tags
            tags_cursor = await db.execute("""
                SELECT t.name FROM tags t
                JOIN reference_tags rt ON t.id = rt.tag_id
                WHERE rt.reference_id = ?
            """, [ref["id"]])
            tags = await tags_cursor.fetchall()
            ref["tags"] = [t["name"] for t in tags]

            # Get collections
            coll_cursor = await db.execute("""
                SELECT c.id, c.name, c.color FROM collections c
                JOIN reference_collections rc ON c.id = rc.collection_id
                WHERE rc.reference_id = ?
            """, [ref["id"]])
            collections = await coll_cursor.fetchall()
            ref["collections"] = [dict(c) for c in collections]

            references.append(ref)

        return references
    finally:
        await db.close()


@router.get("/{reference_id}", response_model=ReferenceResponse)
async def get_reference(reference_id: int):
    """Get single reference by ID"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT r.*,
                (SELECT COUNT(*) FROM annotations WHERE reference_id = r.id) as annotations_count,
                (SELECT COUNT(*) FROM notes WHERE reference_id = r.id) as notes_count
            FROM references r
            WHERE r.id = ?
        """, [reference_id])
        row = await cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Reference not found")

        ref = dict(row)

        # Get tags
        tags_cursor = await db.execute("""
            SELECT t.name FROM tags t
            JOIN reference_tags rt ON t.id = rt.tag_id
            WHERE rt.reference_id = ?
        """, [reference_id])
        tags = await tags_cursor.fetchall()
        ref["tags"] = [t["name"] for t in tags]

        # Get collections
        coll_cursor = await db.execute("""
            SELECT c.id, c.name, c.color FROM collections c
            JOIN reference_collections rc ON c.id = rc.collection_id
            WHERE rc.reference_id = ?
        """, [reference_id])
        collections = await coll_cursor.fetchall()
        ref["collections"] = [dict(c) for c in collections]

        return ref
    finally:
        await db.close()


@router.post("", response_model=ReferenceResponse)
async def create_reference(reference: ReferenceCreate):
    """Create new reference"""
    db = await get_db()
    try:
        # Generate citation key
        citation_key = generate_citation_key(
            reference.title,
            reference.authors or "",
            reference.year
        )

        # Check if citation key exists and make unique
        cursor = await db.execute(
            "SELECT COUNT(*) as count FROM references WHERE citation_key LIKE ?",
            [f"{citation_key}%"]
        )
        count = (await cursor.fetchone())["count"]
        if count > 0:
            citation_key = f"{citation_key}{count + 1}"

        cursor = await db.execute("""
            INSERT INTO references (
                title, title_ar, authors, authors_ar, year, hijri_year,
                type, publisher, journal, volume, issue, pages,
                doi, isbn, url, abstract, abstract_ar, language, citation_key
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            reference.title, reference.title_ar, reference.authors, reference.authors_ar,
            reference.year, reference.hijri_year, reference.type.value,
            reference.publisher, reference.journal, reference.volume, reference.issue,
            reference.pages, reference.doi, reference.isbn, reference.url,
            reference.abstract, reference.abstract_ar, reference.language, citation_key
        ])

        reference_id = cursor.lastrowid

        # Add tags
        if reference.tags:
            for tag_name in reference.tags:
                # Get or create tag
                cursor = await db.execute("SELECT id FROM tags WHERE name = ?", [tag_name])
                tag = await cursor.fetchone()
                if not tag:
                    cursor = await db.execute("INSERT INTO tags (name) VALUES (?)", [tag_name])
                    tag_id = cursor.lastrowid
                else:
                    tag_id = tag["id"]
                await db.execute(
                    "INSERT OR IGNORE INTO reference_tags (reference_id, tag_id) VALUES (?, ?)",
                    [reference_id, tag_id]
                )

        # Add to collections
        if reference.collection_ids:
            for coll_id in reference.collection_ids:
                await db.execute(
                    "INSERT OR IGNORE INTO reference_collections (reference_id, collection_id) VALUES (?, ?)",
                    [reference_id, coll_id]
                )

        await db.commit()
        return await get_reference(reference_id)
    finally:
        await db.close()


@router.put("/{reference_id}", response_model=ReferenceResponse)
async def update_reference(reference_id: int, reference: ReferenceUpdate):
    """Update reference"""
    db = await get_db()
    try:
        # Check exists
        cursor = await db.execute("SELECT id FROM references WHERE id = ?", [reference_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Reference not found")

        # Build update query
        updates = []
        params = []
        update_data = reference.model_dump(exclude_unset=True, exclude={"tags", "collection_ids"})

        for key, value in update_data.items():
            if value is not None:
                if key == "type":
                    updates.append(f"{key} = ?")
                    params.append(value.value)
                elif key == "read_status":
                    updates.append(f"{key} = ?")
                    params.append(value.value)
                else:
                    updates.append(f"{key} = ?")
                    params.append(value)

        if updates:
            updates.append("updated_at = ?")
            params.append(datetime.utcnow().isoformat())
            params.append(reference_id)

            await db.execute(
                f"UPDATE references SET {', '.join(updates)} WHERE id = ?",
                params
            )

        # Update tags
        if reference.tags is not None:
            await db.execute("DELETE FROM reference_tags WHERE reference_id = ?", [reference_id])
            for tag_name in reference.tags:
                cursor = await db.execute("SELECT id FROM tags WHERE name = ?", [tag_name])
                tag = await cursor.fetchone()
                if not tag:
                    cursor = await db.execute("INSERT INTO tags (name) VALUES (?)", [tag_name])
                    tag_id = cursor.lastrowid
                else:
                    tag_id = tag["id"]
                await db.execute(
                    "INSERT OR IGNORE INTO reference_tags (reference_id, tag_id) VALUES (?, ?)",
                    [reference_id, tag_id]
                )

        # Update collections
        if reference.collection_ids is not None:
            await db.execute("DELETE FROM reference_collections WHERE reference_id = ?", [reference_id])
            for coll_id in reference.collection_ids:
                await db.execute(
                    "INSERT OR IGNORE INTO reference_collections (reference_id, collection_id) VALUES (?, ?)",
                    [reference_id, coll_id]
                )

        await db.commit()
        return await get_reference(reference_id)
    finally:
        await db.close()


@router.delete("/{reference_id}")
async def delete_reference(reference_id: int):
    """Delete reference"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM references WHERE id = ?", [reference_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Reference not found")

        await db.execute("DELETE FROM references WHERE id = ?", [reference_id])
        await db.commit()

        return {"success": True, "message": "تم حذف المرجع"}
    finally:
        await db.close()


@router.post("/{reference_id}/favorite")
async def toggle_favorite(reference_id: int):
    """Toggle favorite status"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT is_favorite FROM references WHERE id = ?", [reference_id])
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Reference not found")

        new_status = not row["is_favorite"]
        await db.execute(
            "UPDATE references SET is_favorite = ?, updated_at = ? WHERE id = ?",
            [new_status, datetime.utcnow().isoformat(), reference_id]
        )
        await db.commit()

        return {"success": True, "is_favorite": new_status}
    finally:
        await db.close()


@router.post("/{reference_id}/archive")
async def toggle_archive(reference_id: int):
    """Toggle archive status"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT is_archived FROM references WHERE id = ?", [reference_id])
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Reference not found")

        new_status = not row["is_archived"]
        await db.execute(
            "UPDATE references SET is_archived = ?, updated_at = ? WHERE id = ?",
            [new_status, datetime.utcnow().isoformat(), reference_id]
        )
        await db.commit()

        return {"success": True, "is_archived": new_status}
    finally:
        await db.close()


@router.put("/{reference_id}/read-status")
async def update_read_status(reference_id: int, status: ReadStatus):
    """Update read status"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM references WHERE id = ?", [reference_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Reference not found")

        await db.execute(
            "UPDATE references SET read_status = ?, updated_at = ? WHERE id = ?",
            [status.value, datetime.utcnow().isoformat(), reference_id]
        )
        await db.commit()

        return {"success": True, "read_status": status.value}
    finally:
        await db.close()


@router.put("/{reference_id}/rating")
async def update_rating(reference_id: int, rating: int = Query(ge=0, le=5)):
    """Update rating (0-5)"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM references WHERE id = ?", [reference_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Reference not found")

        await db.execute(
            "UPDATE references SET rating = ?, updated_at = ? WHERE id = ?",
            [rating, datetime.utcnow().isoformat(), reference_id]
        )
        await db.commit()

        return {"success": True, "rating": rating}
    finally:
        await db.close()
