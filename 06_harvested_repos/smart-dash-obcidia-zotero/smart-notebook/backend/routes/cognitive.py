"""
Cognitive Routes - مسارات المرآة المعرفية والزخم البحثي
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta

from database.db import get_db
from models.schemas import (
    CognitiveProfile, MomentumResponse, WeeklyReport,
    CognitivePattern, ReminderCreate, ReminderResponse,
    MomentumTrend
)

router = APIRouter(prefix="/cognitive", tags=["Cognitive"])


# ===== Mirror (المرآة المعرفية) =====

@router.get("/mirror/today", response_model=CognitiveProfile)
async def get_today_profile():
    """Get today's cognitive profile"""
    db = await get_db()
    try:
        today = datetime.now().strftime("%Y-%m-%d")

        cursor = await db.execute("""
            SELECT * FROM cognitive_profile WHERE date = ?
        """, (today,))
        profile = await cursor.fetchone()

        if profile:
            return dict(profile)

        # Return empty profile for today
        return CognitiveProfile(
            date=today,
            notes_created=0,
            notes_edited=0,
            links_created=0,
            questions_asked=0,
            questions_resolved=0,
            active_time_minutes=0
        )
    finally:
        await db.close()


@router.get("/mirror/history")
async def get_cognitive_history(days: int = Query(default=30, ge=1, le=365)):
    """Get cognitive profile history for the last N days"""
    db = await get_db()
    try:
        date_threshold = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

        cursor = await db.execute("""
            SELECT * FROM cognitive_profile
            WHERE date >= ?
            ORDER BY date ASC
        """, (date_threshold,))
        history = await cursor.fetchall()

        return [dict(h) for h in history]
    finally:
        await db.close()


# ===== Momentum (مؤشر الزخم البحثي) =====

@router.get("/momentum", response_model=MomentumResponse)
async def get_momentum():
    """Calculate research momentum score"""
    db = await get_db()
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        two_weeks_ago = (datetime.now() - timedelta(days=14)).strftime("%Y-%m-%d")

        # Calculate current week's activity
        cursor = await db.execute("""
            SELECT COALESCE(SUM(notes_created), 0) as notes,
                   COALESCE(SUM(links_created), 0) as links,
                   COALESCE(SUM(questions_asked), 0) as questions
            FROM cognitive_profile
            WHERE date >= ?
        """, (week_ago,))
        current_week = dict(await cursor.fetchone())

        # Calculate previous week's activity
        cursor = await db.execute("""
            SELECT COALESCE(SUM(notes_created), 0) as notes,
                   COALESCE(SUM(links_created), 0) as links,
                   COALESCE(SUM(questions_asked), 0) as questions
            FROM cognitive_profile
            WHERE date >= ? AND date < ?
        """, (two_weeks_ago, week_ago))
        prev_week = dict(await cursor.fetchone())

        # Calculate score (weighted sum of activities)
        current_score = (
            current_week["notes"] * 10 +
            current_week["links"] * 5 +
            current_week["questions"] * 8
        )
        prev_score = (
            prev_week["notes"] * 10 +
            prev_week["links"] * 5 +
            prev_week["questions"] * 8
        )

        # Determine trend
        if current_score > prev_score * 1.1:
            trend = MomentumTrend.RISING
        elif current_score < prev_score * 0.9:
            trend = MomentumTrend.DECLINING
        else:
            trend = MomentumTrend.STABLE

        # Calculate streak (consecutive days with activity)
        cursor = await db.execute("""
            SELECT date FROM cognitive_profile
            WHERE notes_created > 0 OR notes_edited > 0
            ORDER BY date DESC
        """)
        active_days = await cursor.fetchall()

        streak = 0
        expected_date = datetime.now().date()
        for day in active_days:
            day_date = datetime.strptime(day["date"], "%Y-%m-%d").date()
            if day_date == expected_date or day_date == expected_date - timedelta(days=1):
                streak += 1
                expected_date = day_date - timedelta(days=1)
            else:
                break

        # Get totals
        cursor = await db.execute("SELECT COUNT(*) as count FROM notes WHERE is_archived = 0")
        total_notes = (await cursor.fetchone())["count"]

        cursor = await db.execute("SELECT COUNT(*) as count FROM links")
        total_links = (await cursor.fetchone())["count"]

        cursor = await db.execute("SELECT COUNT(*) as count FROM questions WHERE status = 'open'")
        open_questions = (await cursor.fetchone())["count"]

        cursor = await db.execute("SELECT COUNT(*) as count FROM projects WHERE status = 'active'")
        active_projects = (await cursor.fetchone())["count"]

        return MomentumResponse(
            current_score=current_score,
            trend=trend,
            streak_days=streak,
            total_notes=total_notes,
            total_links=total_links,
            open_questions=open_questions,
            active_projects=active_projects
        )
    finally:
        await db.close()


# ===== Weekly Report (التقرير الأسبوعي) =====

@router.get("/reports/weekly", response_model=WeeklyReport)
async def get_weekly_report():
    """Generate weekly cognitive report"""
    db = await get_db()
    try:
        today = datetime.now()
        week_start = (today - timedelta(days=today.weekday())).strftime("%Y-%m-%d")
        week_end = today.strftime("%Y-%m-%d")

        # Get weekly stats
        cursor = await db.execute("""
            SELECT COALESCE(SUM(notes_created), 0) as notes_created,
                   COALESCE(SUM(notes_edited), 0) as notes_edited,
                   COALESCE(SUM(questions_asked), 0) as questions_asked,
                   COALESCE(SUM(questions_resolved), 0) as questions_resolved,
                   COALESCE(SUM(links_created), 0) as links_created
            FROM cognitive_profile
            WHERE date >= ? AND date <= ?
        """, (week_start, week_end))
        stats = dict(await cursor.fetchone())

        # Find most active day
        cursor = await db.execute("""
            SELECT date, (notes_created + notes_edited + questions_asked) as activity
            FROM cognitive_profile
            WHERE date >= ? AND date <= ?
            ORDER BY activity DESC
            LIMIT 1
        """, (week_start, week_end))
        most_active = await cursor.fetchone()
        most_active_day = most_active["date"] if most_active else None

        # Get primary topics (most used tags this week)
        cursor = await db.execute("""
            SELECT t.name, COUNT(*) as usage
            FROM tags t
            JOIN note_tags nt ON t.id = nt.tag_id
            JOIN notes n ON nt.note_id = n.id
            WHERE n.created_at >= ?
            GROUP BY t.id
            ORDER BY usage DESC
            LIMIT 5
        """, (week_start,))
        topics = await cursor.fetchall()
        primary_topics = [t["name"] for t in topics]

        return WeeklyReport(
            week_start=week_start,
            week_end=week_end,
            notes_created=stats["notes_created"],
            notes_edited=stats["notes_edited"],
            questions_asked=stats["questions_asked"],
            questions_resolved=stats["questions_resolved"],
            links_created=stats["links_created"],
            most_active_day=most_active_day,
            primary_topics=primary_topics
        )
    finally:
        await db.close()


# ===== Patterns (الأنماط المعرفية) =====

@router.get("/patterns")
async def get_cognitive_patterns():
    """Analyze cognitive patterns (behavioral, not content)"""
    db = await get_db()
    try:
        patterns = []

        # Pattern 1: Peak productivity hours
        cursor = await db.execute("""
            SELECT peak_hour, COUNT(*) as frequency
            FROM cognitive_profile
            WHERE peak_hour IS NOT NULL
            GROUP BY peak_hour
            ORDER BY frequency DESC
            LIMIT 3
        """)
        peak_hours = await cursor.fetchall()
        if peak_hours:
            most_productive = peak_hours[0]
            patterns.append(CognitivePattern(
                pattern_type="peak_hour",
                description=f"أكثر ساعات الإنتاجية: {most_productive['peak_hour']}:00",
                frequency=most_productive["frequency"],
                last_occurrence=datetime.now().strftime("%Y-%m-%d")
            ))

        # Pattern 2: Linking behavior
        cursor = await db.execute("""
            SELECT AVG(links_created * 1.0 / NULLIF(notes_created, 0)) as avg_links_per_note
            FROM cognitive_profile
            WHERE notes_created > 0
        """)
        linking = await cursor.fetchone()
        if linking and linking["avg_links_per_note"]:
            avg_links = round(linking["avg_links_per_note"], 1)
            patterns.append(CognitivePattern(
                pattern_type="linking",
                description=f"متوسط الروابط لكل ملاحظة: {avg_links}",
                frequency=1,
                last_occurrence=datetime.now().strftime("%Y-%m-%d")
            ))

        # Pattern 3: Question resolution rate
        cursor = await db.execute("""
            SELECT SUM(questions_resolved) as resolved, SUM(questions_asked) as asked
            FROM cognitive_profile
        """)
        questions = await cursor.fetchone()
        if questions and questions["asked"]:
            rate = round(questions["resolved"] / questions["asked"] * 100, 1)
            patterns.append(CognitivePattern(
                pattern_type="question_resolution",
                description=f"معدل حل الأسئلة: {rate}%",
                frequency=1,
                last_occurrence=datetime.now().strftime("%Y-%m-%d")
            ))

        return patterns
    finally:
        await db.close()


# ===== Reminders (التذكيرات) =====

@router.get("/reminders/due", response_model=List[ReminderResponse])
async def get_due_reminders():
    """Get reminders that are due"""
    db = await get_db()
    try:
        today = datetime.now().strftime("%Y-%m-%d")

        cursor = await db.execute("""
            SELECT * FROM reminders
            WHERE due_date <= ? AND is_completed = 0
            ORDER BY due_date ASC
        """, (today,))
        reminders = await cursor.fetchall()

        return [dict(r) for r in reminders]
    finally:
        await db.close()


@router.get("/reminders/upcoming", response_model=List[ReminderResponse])
async def get_upcoming_reminders(days: int = Query(default=7, ge=1, le=30)):
    """Get upcoming reminders for the next N days"""
    db = await get_db()
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        future = (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")

        cursor = await db.execute("""
            SELECT * FROM reminders
            WHERE due_date BETWEEN ? AND ? AND is_completed = 0
            ORDER BY due_date ASC
        """, (today, future))
        reminders = await cursor.fetchall()

        return [dict(r) for r in reminders]
    finally:
        await db.close()


@router.post("/reminders", response_model=ReminderResponse)
async def create_reminder(reminder: ReminderCreate):
    """Create a new reminder"""
    db = await get_db()
    try:
        now = datetime.now().isoformat()

        cursor = await db.execute(
            """INSERT INTO reminders (note_id, content, reminder_type, due_date, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (reminder.note_id, reminder.content, reminder.reminder_type, reminder.due_date, now)
        )
        reminder_id = cursor.lastrowid
        await db.commit()

        cursor = await db.execute("SELECT * FROM reminders WHERE id = ?", (reminder_id,))
        return dict(await cursor.fetchone())
    finally:
        await db.close()


@router.post("/reminders/{reminder_id}/complete")
async def complete_reminder(reminder_id: int):
    """Mark a reminder as completed"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM reminders WHERE id = ?", (reminder_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Reminder not found")

        now = datetime.now().isoformat()
        await db.execute(
            "UPDATE reminders SET is_completed = 1, completed_at = ? WHERE id = ?",
            (now, reminder_id)
        )
        await db.commit()

        return {"message": "Reminder completed"}
    finally:
        await db.close()
