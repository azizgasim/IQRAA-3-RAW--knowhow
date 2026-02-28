"""
Integration Routes - التكامل مع منصة إقرأ
"""

from fastapi import APIRouter, HTTPException
from typing import List

from ..database.db import get_db
from ..models.schemas import (
    SendToNotebookRequest, SendToGraphRequest, ReceiveFromIqraRequest
)

router = APIRouter(prefix="/integration", tags=["integration"])


# === إلى المفكرة الذكية ===

@router.post("/send-to-notebook")
async def send_to_notebook(request: SendToNotebookRequest):
    """
    إرسال مرجع إلى المفكرة الذكية
    - يرسل معلومات المرجع مع التعليقات والملاحظات
    """
    db = await get_db()
    try:
        # Get reference
        cursor = await db.execute(
            "SELECT * FROM references WHERE id = ?",
            [request.reference_id]
        )
        ref = await cursor.fetchone()

        if not ref:
            raise HTTPException(status_code=404, detail="Reference not found")

        ref = dict(ref)
        data = {
            "source": "zotero_smart",
            "type": "reference",
            "reference": {
                "id": ref["id"],
                "title": ref["title"],
                "title_ar": ref.get("title_ar"),
                "authors": ref.get("authors"),
                "year": ref.get("year"),
                "citation_key": ref.get("citation_key"),
            }
        }

        # Include annotations if requested
        if request.include_annotations:
            cursor = await db.execute(
                "SELECT * FROM annotations WHERE reference_id = ?",
                [request.reference_id]
            )
            annotations = [dict(row) for row in await cursor.fetchall()]
            data["annotations"] = annotations

        # Include notes if requested
        if request.include_notes:
            cursor = await db.execute(
                "SELECT * FROM notes WHERE reference_id = ?",
                [request.reference_id]
            )
            notes = [dict(row) for row in await cursor.fetchall()]
            data["notes"] = notes

        # في التطبيق الفعلي، سيتم إرسال البيانات إلى API المفكرة الذكية
        # هنا نُرجع البيانات التي سترسل
        return {
            "success": True,
            "message": "جاهز للإرسال إلى المفكرة الذكية",
            "data": data
        }
    finally:
        await db.close()


# === إلى UltraGraph ===

@router.post("/send-to-graph")
async def send_to_graph(request: SendToGraphRequest):
    """
    إرسال مراجع إلى UltraGraph
    - يرسل المراجع مع العلاقات بينها للعرض في الشبكة
    """
    db = await get_db()
    try:
        placeholders = ",".join(["?" for _ in request.reference_ids])

        # Get references
        cursor = await db.execute(
            f"SELECT id, title, title_ar, authors, year, type FROM references WHERE id IN ({placeholders})",
            request.reference_ids
        )
        references = [dict(row) for row in await cursor.fetchall()]

        if not references:
            raise HTTPException(status_code=404, detail="No references found")

        data = {
            "source": "zotero_smart",
            "nodes": [
                {
                    "id": f"ref_{r['id']}",
                    "label": r["title_ar"] or r["title"],
                    "type": r["type"],
                    "data": r
                }
                for r in references
            ],
            "edges": []
        }

        # Include relations if requested
        if request.include_relations:
            cursor = await db.execute(f"""
                SELECT rr.*, r.title as target_title
                FROM related_references rr
                JOIN references r ON rr.target_id = r.id
                WHERE rr.source_id IN ({placeholders}) OR rr.target_id IN ({placeholders})
            """, request.reference_ids + request.reference_ids)

            relations = [dict(row) for row in await cursor.fetchall()]
            data["edges"] = [
                {
                    "source": f"ref_{rel['source_id']}",
                    "target": f"ref_{rel['target_id']}",
                    "type": rel["relation_type"],
                    "label": rel.get("note", "")
                }
                for rel in relations
            ]

        return {
            "success": True,
            "message": "جاهز للإرسال إلى UltraGraph",
            "data": data
        }
    finally:
        await db.close()


# === من القارئ الذكي ===

@router.post("/receive-from-reader")
async def receive_from_reader(request: ReceiveFromIqraRequest):
    """
    استقبال بيانات من القارئ الذكي
    - إضافة اقتباس كتعليق
    - إضافة ملاحظة للمرجع
    """
    db = await get_db()
    try:
        data = request.data
        action = data.get("action")
        reference_id = data.get("reference_id")

        if not reference_id:
            raise HTTPException(status_code=400, detail="reference_id is required")

        # Verify reference exists
        cursor = await db.execute(
            "SELECT id FROM references WHERE id = ?",
            [reference_id]
        )
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Reference not found")

        if action == "add_quote":
            # إضافة اقتباس كتعليق
            cursor = await db.execute("""
                INSERT INTO annotations (
                    reference_id, type, content, comment, page_number, color
                ) VALUES (?, 'highlight', ?, ?, ?, '#fef08a')
            """, [
                reference_id,
                data.get("quote_text"),
                data.get("note"),
                data.get("page_number")
            ])

        elif action == "add_note":
            # إضافة ملاحظة
            cursor = await db.execute("""
                INSERT INTO notes (reference_id, title, content, note_type)
                VALUES (?, ?, ?, 'general')
            """, [
                reference_id,
                data.get("title", "ملاحظة من القارئ"),
                data.get("content")
            ])

        await db.commit()

        return {
            "success": True,
            "message": "تم استقبال البيانات من القارئ الذكي"
        }
    finally:
        await db.close()


# === من الوكيل الذكي ===

@router.post("/receive-from-agent")
async def receive_from_agent(request: ReceiveFromIqraRequest):
    """
    استقبال توصيات من الوكيل الذكي
    - إضافة مرجع موصى به
    - إضافة علاقة بين المراجع
    """
    db = await get_db()
    try:
        data = request.data
        action = data.get("action")

        if action == "suggest_reference":
            # إضافة مرجع موصى به من الوكيل
            ref_data = data.get("reference", {})
            cursor = await db.execute("""
                INSERT INTO references (
                    title, title_ar, authors, authors_ar, year,
                    type, abstract, abstract_ar, language
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, [
                ref_data.get("title"),
                ref_data.get("title_ar"),
                ref_data.get("authors"),
                ref_data.get("authors_ar"),
                ref_data.get("year"),
                ref_data.get("type", "book"),
                ref_data.get("abstract"),
                ref_data.get("abstract_ar"),
                ref_data.get("language", "ar")
            ])

            reference_id = cursor.lastrowid

            # Add agent suggestion tag
            cursor = await db.execute(
                "INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)",
                ["توصية الوكيل", "#8b5cf6"]
            )
            cursor = await db.execute("SELECT id FROM tags WHERE name = ?", ["توصية الوكيل"])
            tag = await cursor.fetchone()
            if tag:
                await db.execute(
                    "INSERT INTO reference_tags (reference_id, tag_id) VALUES (?, ?)",
                    [reference_id, tag["id"]]
                )

        elif action == "suggest_relation":
            # إضافة علاقة بين مرجعين
            await db.execute("""
                INSERT INTO related_references (source_id, target_id, relation_type, note)
                VALUES (?, ?, ?, ?)
            """, [
                data.get("source_id"),
                data.get("target_id"),
                data.get("relation_type", "related"),
                data.get("note", "توصية من الوكيل الذكي")
            ])

        await db.commit()

        return {
            "success": True,
            "message": "تم استقبال التوصية من الوكيل الذكي"
        }
    finally:
        await db.close()


# === نقاط التكامل المتاحة ===

@router.get("/endpoints")
async def get_integration_endpoints():
    """قائمة نقاط التكامل المتاحة"""
    return {
        "outgoing": [
            {
                "name": "send-to-notebook",
                "description": "إرسال مرجع إلى المفكرة الذكية",
                "endpoint": "/integration/send-to-notebook"
            },
            {
                "name": "send-to-graph",
                "description": "إرسال مراجع إلى UltraGraph",
                "endpoint": "/integration/send-to-graph"
            }
        ],
        "incoming": [
            {
                "name": "receive-from-reader",
                "description": "استقبال بيانات من القارئ الذكي",
                "endpoint": "/integration/receive-from-reader"
            },
            {
                "name": "receive-from-agent",
                "description": "استقبال توصيات من الوكيل الذكي",
                "endpoint": "/integration/receive-from-agent"
            }
        ]
    }
