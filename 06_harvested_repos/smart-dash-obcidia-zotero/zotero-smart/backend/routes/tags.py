"""
Tags Routes - إدارة الوسوم
"""

from fastapi import APIRouter, HTTPException
from typing import List

from ..database.db import get_db
from ..models.schemas import TagCreate, TagResponse

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=List[TagResponse])
async def get_tags():
    """Get all tags with usage count"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT t.*,
                (SELECT COUNT(*) FROM reference_tags WHERE tag_id = t.id) as references_count
            FROM tags t
            ORDER BY references_count DESC, t.name
        """)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()


@router.get("/{tag_id}", response_model=TagResponse)
async def get_tag(tag_id: int):
    """Get single tag"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT t.*,
                (SELECT COUNT(*) FROM reference_tags WHERE tag_id = t.id) as references_count
            FROM tags t
            WHERE t.id = ?
        """, [tag_id])
        row = await cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Tag not found")

        return dict(row)
    finally:
        await db.close()


@router.post("", response_model=TagResponse)
async def create_tag(tag: TagCreate):
    """Create new tag"""
    db = await get_db()
    try:
        # Check if exists
        cursor = await db.execute("SELECT id FROM tags WHERE name = ?", [tag.name])
        if await cursor.fetchone():
            raise HTTPException(status_code=400, detail="Tag already exists")

        cursor = await db.execute(
            "INSERT INTO tags (name, color) VALUES (?, ?)",
            [tag.name, tag.color]
        )
        await db.commit()

        return await get_tag(cursor.lastrowid)
    finally:
        await db.close()


@router.put("/{tag_id}", response_model=TagResponse)
async def update_tag(tag_id: int, tag: TagCreate):
    """Update tag"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM tags WHERE id = ?", [tag_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Tag not found")

        await db.execute(
            "UPDATE tags SET name = ?, color = ? WHERE id = ?",
            [tag.name, tag.color, tag_id]
        )
        await db.commit()

        return await get_tag(tag_id)
    finally:
        await db.close()


@router.delete("/{tag_id}")
async def delete_tag(tag_id: int):
    """Delete tag"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM tags WHERE id = ?", [tag_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Tag not found")

        await db.execute("DELETE FROM tags WHERE id = ?", [tag_id])
        await db.commit()

        return {"success": True, "message": "تم حذف الوسم"}
    finally:
        await db.close()


@router.post("/{tag_id}/merge/{target_tag_id}")
async def merge_tags(tag_id: int, target_tag_id: int):
    """Merge tag into another tag"""
    db = await get_db()
    try:
        # Check both exist
        cursor = await db.execute("SELECT id FROM tags WHERE id = ?", [tag_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Source tag not found")

        cursor = await db.execute("SELECT id FROM tags WHERE id = ?", [target_tag_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Target tag not found")

        # Move all references to target tag
        await db.execute("""
            UPDATE OR IGNORE reference_tags
            SET tag_id = ?
            WHERE tag_id = ?
        """, [target_tag_id, tag_id])

        # Delete orphaned references
        await db.execute("""
            DELETE FROM reference_tags WHERE tag_id = ?
        """, [tag_id])

        # Delete source tag
        await db.execute("DELETE FROM tags WHERE id = ?", [tag_id])
        await db.commit()

        return {"success": True, "message": "تم دمج الوسوم"}
    finally:
        await db.close()
