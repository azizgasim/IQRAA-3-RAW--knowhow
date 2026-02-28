"""
Annotations & Notes Routes - التعليقات والملاحظات
"""

from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from ..database.db import get_db
from ..models.schemas import (
    AnnotationCreate, AnnotationUpdate, AnnotationResponse,
    NoteCreate, NoteUpdate, NoteResponse
)

router = APIRouter(tags=["annotations"])


# === Annotations ===

@router.get("/references/{reference_id}/annotations", response_model=List[AnnotationResponse])
async def get_annotations(reference_id: int):
    """Get all annotations for a reference"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT * FROM annotations
            WHERE reference_id = ?
            ORDER BY page_number, created_at
        """, [reference_id])
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()


@router.post("/annotations", response_model=AnnotationResponse)
async def create_annotation(annotation: AnnotationCreate):
    """Create new annotation"""
    db = await get_db()
    try:
        # Check reference exists
        cursor = await db.execute(
            "SELECT id FROM references WHERE id = ?",
            [annotation.reference_id]
        )
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Reference not found")

        cursor = await db.execute("""
            INSERT INTO annotations (
                reference_id, type, content, comment,
                page_number, position_data, color
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, [
            annotation.reference_id, annotation.type.value, annotation.content,
            annotation.comment, annotation.page_number, annotation.position_data,
            annotation.color
        ])
        await db.commit()

        annotation_id = cursor.lastrowid
        cursor = await db.execute("SELECT * FROM annotations WHERE id = ?", [annotation_id])
        return dict(await cursor.fetchone())
    finally:
        await db.close()


@router.put("/annotations/{annotation_id}", response_model=AnnotationResponse)
async def update_annotation(annotation_id: int, annotation: AnnotationUpdate):
    """Update annotation"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM annotations WHERE id = ?", [annotation_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Annotation not found")

        updates = []
        params = []
        update_data = annotation.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if value is not None:
                updates.append(f"{key} = ?")
                params.append(value)

        if updates:
            updates.append("updated_at = ?")
            params.append(datetime.utcnow().isoformat())
            params.append(annotation_id)

            await db.execute(
                f"UPDATE annotations SET {', '.join(updates)} WHERE id = ?",
                params
            )
            await db.commit()

        cursor = await db.execute("SELECT * FROM annotations WHERE id = ?", [annotation_id])
        return dict(await cursor.fetchone())
    finally:
        await db.close()


@router.delete("/annotations/{annotation_id}")
async def delete_annotation(annotation_id: int):
    """Delete annotation"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM annotations WHERE id = ?", [annotation_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Annotation not found")

        await db.execute("DELETE FROM annotations WHERE id = ?", [annotation_id])
        await db.commit()

        return {"success": True, "message": "تم حذف التعليق"}
    finally:
        await db.close()


# === Notes ===

@router.get("/references/{reference_id}/notes", response_model=List[NoteResponse])
async def get_notes(reference_id: int):
    """Get all notes for a reference"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT * FROM notes
            WHERE reference_id = ?
            ORDER BY created_at DESC
        """, [reference_id])
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()


@router.post("/notes", response_model=NoteResponse)
async def create_note(note: NoteCreate):
    """Create new note"""
    db = await get_db()
    try:
        # Check reference exists
        cursor = await db.execute(
            "SELECT id FROM references WHERE id = ?",
            [note.reference_id]
        )
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Reference not found")

        cursor = await db.execute("""
            INSERT INTO notes (reference_id, title, content, note_type)
            VALUES (?, ?, ?, ?)
        """, [note.reference_id, note.title, note.content, note.note_type.value])
        await db.commit()

        note_id = cursor.lastrowid
        cursor = await db.execute("SELECT * FROM notes WHERE id = ?", [note_id])
        return dict(await cursor.fetchone())
    finally:
        await db.close()


@router.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(note_id: int, note: NoteUpdate):
    """Update note"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM notes WHERE id = ?", [note_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Note not found")

        updates = []
        params = []
        update_data = note.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if value is not None:
                if key == "note_type":
                    updates.append(f"{key} = ?")
                    params.append(value.value)
                else:
                    updates.append(f"{key} = ?")
                    params.append(value)

        if updates:
            updates.append("updated_at = ?")
            params.append(datetime.utcnow().isoformat())
            params.append(note_id)

            await db.execute(
                f"UPDATE notes SET {', '.join(updates)} WHERE id = ?",
                params
            )
            await db.commit()

        cursor = await db.execute("SELECT * FROM notes WHERE id = ?", [note_id])
        return dict(await cursor.fetchone())
    finally:
        await db.close()


@router.delete("/notes/{note_id}")
async def delete_note(note_id: int):
    """Delete note"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM notes WHERE id = ?", [note_id])
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Note not found")

        await db.execute("DELETE FROM notes WHERE id = ?", [note_id])
        await db.commit()

        return {"success": True, "message": "تم حذف الملاحظة"}
    finally:
        await db.close()
