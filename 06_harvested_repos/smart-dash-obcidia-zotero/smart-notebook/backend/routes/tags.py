"""
Tags Routes - مسارات الوسوم
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta

from database.db import get_db
from models.schemas import TagCreate, TagResponse

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.get("/", response_model=List[TagResponse])
async def get_tags(
    limit: int = Query(default=100, ge=1, le=500),
    order_by: str = Query(default="usage", regex="^(usage|name|created)$")
):
    """Get all tags"""
    db = await get_db()
    try:
        order_clause = {
            "usage": "usage_count DESC",
            "name": "name ASC",
            "created": "created_at DESC"
        }.get(order_by, "usage_count DESC")

        cursor = await db.execute(f"""
            SELECT * FROM tags ORDER BY {order_clause} LIMIT ?
        """, (limit,))
        tags = await cursor.fetchall()
        return [dict(tag) for tag in tags]
    finally:
        await db.close()


@router.get("/stats/frequent")
async def get_frequent_concepts(days: int = Query(default=30, ge=1, le=365)):
    """Get frequently used concepts/tags in the last N days"""
    db = await get_db()
    try:
        date_threshold = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

        cursor = await db.execute("""
            SELECT t.name, t.color, COUNT(*) as recent_usage
            FROM tags t
            JOIN note_tags nt ON t.id = nt.tag_id
            JOIN notes n ON nt.note_id = n.id
            WHERE n.created_at >= ?
            GROUP BY t.id
            ORDER BY recent_usage DESC
            LIMIT 20
        """, (date_threshold,))

        concepts = await cursor.fetchall()
        return [dict(c) for c in concepts]
    finally:
        await db.close()


@router.post("/", response_model=TagResponse)
async def create_tag(tag: TagCreate):
    """Create a new tag"""
    db = await get_db()
    try:
        # Check if tag already exists
        cursor = await db.execute("SELECT id FROM tags WHERE name = ?", (tag.name,))
        if await cursor.fetchone():
            raise HTTPException(status_code=400, detail="Tag already exists")

        now = datetime.now().isoformat()
        cursor = await db.execute(
            "INSERT INTO tags (name, color, created_at) VALUES (?, ?, ?)",
            (tag.name, tag.color, now)
        )
        tag_id = cursor.lastrowid
        await db.commit()

        cursor = await db.execute("SELECT * FROM tags WHERE id = ?", (tag_id,))
        return dict(await cursor.fetchone())
    finally:
        await db.close()


@router.put("/{tag_id}", response_model=TagResponse)
async def update_tag(tag_id: int, tag: TagCreate):
    """Update a tag"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM tags WHERE id = ?", (tag_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Tag not found")

        await db.execute(
            "UPDATE tags SET name = ?, color = ? WHERE id = ?",
            (tag.name, tag.color, tag_id)
        )
        await db.commit()

        cursor = await db.execute("SELECT * FROM tags WHERE id = ?", (tag_id,))
        return dict(await cursor.fetchone())
    finally:
        await db.close()


@router.delete("/{tag_id}")
async def delete_tag(tag_id: int):
    """Delete a tag"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM tags WHERE id = ?", (tag_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Tag not found")

        await db.execute("DELETE FROM tags WHERE id = ?", (tag_id,))
        await db.commit()

        return {"message": "Tag deleted successfully"}
    finally:
        await db.close()
