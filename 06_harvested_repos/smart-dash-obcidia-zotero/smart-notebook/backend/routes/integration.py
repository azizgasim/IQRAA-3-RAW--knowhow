"""
Integration Routes - مسارات التكامل مع منصة إقرأ
6 نقاط تكامل فقط كما هو محدد في التوثيق
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime
import httpx

from database.db import get_db
from models.schemas import (
    IqraIntegrationStatus, IqraNoteInput, IqraQuotationInput,
    IqraSearchQuery, IqraAnalysisRequest, NoteResponse, QuotationResponse
)

router = APIRouter(prefix="/integration", tags=["Integration"])

# Iqra API configuration (would be from environment in production)
IQRA_API_BASE = "http://localhost:8000/api"  # Placeholder


# ===== Status =====

@router.get("/status", response_model=IqraIntegrationStatus)
async def get_integration_status():
    """Check integration status with Iqra platform"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{IQRA_API_BASE}/health")
            connected = response.status_code == 200
    except Exception:
        connected = False

    return IqraIntegrationStatus(
        connected=connected,
        last_check=datetime.now().isoformat(),
        pending_items=0
    )


# ===== من إقرأ إلى Obsidia (3 نقاط) =====

@router.post("/from-iqra/note", response_model=NoteResponse)
async def add_note_from_iqra(note_input: IqraNoteInput):
    """
    INT-01: زر "أضف للمفكرة"
    إضافة ملاحظة من منصة إقرأ
    ما يُنقل: ملاحظة + رابط
    ما لا يُنقل: metadata، تفاصيل المعالجة
    """
    db = await get_db()
    try:
        now = datetime.now().isoformat()

        cursor = await db.execute(
            """INSERT INTO notes (title, content, source, source_ref, created_at, updated_at)
               VALUES (?, ?, 'iqra', ?, ?, ?)""",
            (note_input.title, note_input.content, note_input.source_ref, now, now)
        )
        note_id = cursor.lastrowid

        # Handle tags
        for tag_name in note_input.tags:
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

        # Update cognitive profile
        today = datetime.now().strftime("%Y-%m-%d")
        await db.execute("""
            INSERT INTO cognitive_profile (date, notes_created)
            VALUES (?, 1)
            ON CONFLICT(date) DO UPDATE SET notes_created = notes_created + 1
        """, (today,))

        await db.commit()

        # Return created note
        cursor = await db.execute("""
            SELECT n.*, 0 as links_count, 0 as backlinks_count
            FROM notes n WHERE n.id = ?
        """, (note_id,))
        note = dict(await cursor.fetchone())

        cursor = await db.execute("""
            SELECT t.name FROM tags t
            JOIN note_tags nt ON t.id = nt.tag_id
            WHERE nt.note_id = ?
        """, (note_id,))
        tags = await cursor.fetchall()
        note["tags"] = [t["name"] for t in tags]

        return note
    finally:
        await db.close()


@router.post("/from-iqra/quotation", response_model=QuotationResponse)
async def add_quotation_from_iqra(quotation_input: IqraQuotationInput):
    """
    INT-02: "أضف كاقتباس"
    إضافة اقتباس من منصة إقرأ
    ما يُنقل: النص + رابط المصدر
    ما لا يُنقل: تحليل الاقتباس
    """
    db = await get_db()
    try:
        now = datetime.now().isoformat()

        cursor = await db.execute(
            """INSERT INTO quotations
               (content, source_title, source_ref, page_number, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (quotation_input.content, quotation_input.source_title,
             quotation_input.source_ref, quotation_input.page_number, now)
        )
        quotation_id = cursor.lastrowid
        await db.commit()

        cursor = await db.execute("SELECT * FROM quotations WHERE id = ?", (quotation_id,))
        quotation = dict(await cursor.fetchone())
        quotation["tags"] = []

        return quotation
    finally:
        await db.close()


@router.post("/from-iqra/analysis-complete")
async def notify_analysis_complete(source_ref: str, analysis_type: str):
    """
    INT-03: إشعار بانتهاء تحليل
    ما يُنقل: تنبيه فقط
    ما لا يُنقل: نتائج التحليل (تبقى في المنصة)
    """
    db = await get_db()
    try:
        now = datetime.now().isoformat()
        due_date = datetime.now().strftime("%Y-%m-%d")

        # Create a reminder about the completed analysis
        cursor = await db.execute(
            """INSERT INTO reminders (content, reminder_type, due_date, created_at)
               VALUES (?, 'iqra_analysis', ?, ?)""",
            (f"اكتمل تحليل من نوع '{analysis_type}' للمصدر: {source_ref}", due_date, now)
        )
        await db.commit()

        return {"message": "Analysis notification recorded"}
    finally:
        await db.close()


# ===== من Obsidia إلى إقرأ (3 نقاط) =====

@router.post("/to-iqra/search")
async def search_in_iqra(query: IqraSearchQuery):
    """
    INT-04: زر "ابحث في إقرأ"
    ما يُرسل: نص الاستعلام
    ما لا يُرسل: سياق الملاحظات الشخصية
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{IQRA_API_BASE}/search",
                json={
                    "query": query.query,
                    "search_type": query.search_type
                }
            )

            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "status": "error",
                    "message": "Search service unavailable",
                    "results": []
                }
    except Exception as e:
        return {
            "status": "offline",
            "message": "Cannot connect to Iqra platform",
            "results": []
        }


@router.post("/to-iqra/analyze")
async def request_iqra_analysis(request: IqraAnalysisRequest):
    """
    INT-05: زر "اطلب تحليل"
    يُرسل النص المحدد للوكلاء في المنصة
    ما يُرسل: النص المحدد فقط
    ما لا يُرسل: ملاحظات أخرى أو سياق شخصي
    """
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{IQRA_API_BASE}/agents/analyze",
                json={
                    "content": request.content,
                    "analysis_type": request.analysis_type
                }
            )

            if response.status_code == 200:
                return {
                    "status": "submitted",
                    "message": "Analysis request submitted successfully",
                    "data": response.json()
                }
            else:
                return {
                    "status": "error",
                    "message": "Analysis service unavailable"
                }
    except Exception as e:
        return {
            "status": "offline",
            "message": "Cannot connect to Iqra platform"
        }


@router.get("/to-iqra/open-source/{source_ref}")
async def open_source_in_iqra(source_ref: str):
    """
    INT-06: زر "افتح المصدر"
    يُولّد رابط لفتح المصدر في منصة إقرأ
    ما يُرسل: طلب فتح فقط
    ما لا يُرسل: بيانات شخصية
    """
    # Generate link to open source in Iqra
    iqra_link = f"{IQRA_API_BASE.replace('/api', '')}/sources/{source_ref}"

    return {
        "redirect_url": iqra_link,
        "source_ref": source_ref,
        "message": "Open this URL to view the source in Iqra platform"
    }


# ===== القاعدة الحاسمة =====
# Obsidia لا تستورد بيانات المنصة، ولا تُصدّر ملاحظات الباحث
# هذه الـ 6 نقاط هي الوحيدة المسموح بها
