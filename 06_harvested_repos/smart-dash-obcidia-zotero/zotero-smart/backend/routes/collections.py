"""
Collections Routes - إدارة المجموعات
"""

from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from ..database.db import get_db
from ..models.schemas import CollectionCreate, CollectionUpdate, CollectionResponse

router = APIRouter(prefix="/collections", tags=["collections"])


@router.get("", response_model=List[CollectionResponse])
async def get_collections(flat: bool = False):
    """Get all collections (hierarchical or flat)"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT c.*,
                (SELECT COUNT(*) FROM reference_collections WHERE collection_id = c.id) as references_count
            FROM collections c
            ORDER BY c.sort_order, c.name
        """)
        rows = await cursor.fetchall()
        collections = [dict(row) for row in rows]

        if flat:
            return collections

        # Build hierarchy
        def build_tree(parent_id=None):
            children = []
            for coll in collections:
                if coll["parent_id"] == parent_id:
                    coll["children"] = build_tree(coll["id"])
                    children.append(coll)
            return children

        return build_tree()
    finally:
        await db.close()


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(collection_id: int):
    """Get single collection"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT c.*,
                (SELECT COUNT(*) FROM reference_collections WHERE collection_id = c.id) as references_count
            FROM collections c
            WHERE c.id = ?
        """, [collection_id])
        row = await cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Collection not found")

        coll = dict(row)

        # Get children
        children_cursor = await db.execute("""
            SELECT c.*,
                (SELECT COUNT(*) FROM reference_collections WHERE collection_id = c.id) as references_count
            FROM collections c
            WHERE c.parent_id = ?
            ORDER BY c.sort_order, c.name
        """, [collection_id])
        children = await children_cursor.fetchall()
        coll["children"] = [dict(c) for c in children]

        return coll
    finally:
        await db.close()


@router.post("", response_model=CollectionResponse)
async def create_collection(collection: CollectionCreate):
    """Create new collection"""
    db = await get_db()
    try:
        # Check parent exists if provided
        if collection.parent_id:
            cursor = await db.execute(
                "SELECT id FROM collections WHERE id = ?",
                [collection.parent_id]
            )
            if not await cursor.fetchone():
                raise HTTPException(status_code=404, detail="Parent collection not found")

        cursor = await db.execute("""
            INSERT INTO collections (name, name_ar, description, parent_id, color, icon)
            VALUES (?, ?, ?, ?, ?, ?)
        """, [
            collection.name, collection.name_ar, collection.description,
            collection.parent_id, collection.color, collection.icon
        ])

        await db.commit()
        return await get_collection(cursor.lastrowid)
    finally:
        await db.close()


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(collection_id: int, collection: CollectionUpdate):
    """Update collection"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM collections WHERE id = ?", [collection_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Collection not found")

        updates = []
        params = []
        update_data = collection.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if value is not None:
                updates.append(f"{key} = ?")
                params.append(value)

        if updates:
            params.append(collection_id)
            await db.execute(
                f"UPDATE collections SET {', '.join(updates)} WHERE id = ?",
                params
            )
            await db.commit()

        return await get_collection(collection_id)
    finally:
        await db.close()


@router.delete("/{collection_id}")
async def delete_collection(collection_id: int, move_children_to: int = None):
    """Delete collection"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM collections WHERE id = ?", [collection_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Collection not found")

        # Handle children
        if move_children_to:
            await db.execute(
                "UPDATE collections SET parent_id = ? WHERE parent_id = ?",
                [move_children_to, collection_id]
            )
        else:
            # Set children to root level
            await db.execute(
                "UPDATE collections SET parent_id = NULL WHERE parent_id = ?",
                [collection_id]
            )

        # Delete collection (reference_collections will cascade)
        await db.execute("DELETE FROM collections WHERE id = ?", [collection_id])
        await db.commit()

        return {"success": True, "message": "تم حذف المجموعة"}
    finally:
        await db.close()


@router.post("/{collection_id}/references/{reference_id}")
async def add_reference_to_collection(collection_id: int, reference_id: int):
    """Add reference to collection"""
    db = await get_db()
    try:
        # Check both exist
        cursor = await db.execute("SELECT id FROM collections WHERE id = ?", [collection_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Collection not found")

        cursor = await db.execute("SELECT id FROM references WHERE id = ?", [reference_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Reference not found")

        await db.execute("""
            INSERT OR IGNORE INTO reference_collections (reference_id, collection_id)
            VALUES (?, ?)
        """, [reference_id, collection_id])
        await db.commit()

        return {"success": True, "message": "تم إضافة المرجع للمجموعة"}
    finally:
        await db.close()


@router.delete("/{collection_id}/references/{reference_id}")
async def remove_reference_from_collection(collection_id: int, reference_id: int):
    """Remove reference from collection"""
    db = await get_db()
    try:
        await db.execute("""
            DELETE FROM reference_collections
            WHERE collection_id = ? AND reference_id = ?
        """, [collection_id, reference_id])
        await db.commit()

        return {"success": True, "message": "تم إزالة المرجع من المجموعة"}
    finally:
        await db.close()


@router.put("/reorder")
async def reorder_collections(collection_orders: List[dict]):
    """Reorder collections"""
    db = await get_db()
    try:
        for item in collection_orders:
            await db.execute(
                "UPDATE collections SET sort_order = ? WHERE id = ?",
                [item["sort_order"], item["id"]]
            )
        await db.commit()

        return {"success": True, "message": "تم إعادة ترتيب المجموعات"}
    finally:
        await db.close()
