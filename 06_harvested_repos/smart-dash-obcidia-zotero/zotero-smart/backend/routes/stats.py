"""
Statistics Routes - الإحصائيات والتقارير
"""

from fastapi import APIRouter
from datetime import datetime, timedelta

from ..database.db import get_db
from ..models.schemas import LibraryStats, ReadingStats

router = APIRouter(prefix="/stats", tags=["statistics"])


@router.get("/library", response_model=LibraryStats)
async def get_library_stats():
    """Get overall library statistics"""
    db = await get_db()
    try:
        # Total references
        cursor = await db.execute("SELECT COUNT(*) as count FROM references")
        total = (await cursor.fetchone())["count"]

        # By type
        cursor = await db.execute("""
            SELECT type, COUNT(*) as count
            FROM references
            GROUP BY type
        """)
        by_type = {row["type"]: row["count"] for row in await cursor.fetchall()}

        # By year (last 10 years)
        cursor = await db.execute("""
            SELECT year, COUNT(*) as count
            FROM references
            WHERE year IS NOT NULL
            GROUP BY year
            ORDER BY year DESC
            LIMIT 10
        """)
        by_year = {str(row["year"]): row["count"] for row in await cursor.fetchall()}

        # By language
        cursor = await db.execute("""
            SELECT language, COUNT(*) as count
            FROM references
            GROUP BY language
        """)
        by_language = {row["language"]: row["count"] for row in await cursor.fetchall()}

        # By read status
        cursor = await db.execute("""
            SELECT read_status, COUNT(*) as count
            FROM references
            GROUP BY read_status
        """)
        by_read_status = {row["read_status"]: row["count"] for row in await cursor.fetchall()}

        # Total annotations
        cursor = await db.execute("SELECT COUNT(*) as count FROM annotations")
        total_annotations = (await cursor.fetchone())["count"]

        # Total notes
        cursor = await db.execute("SELECT COUNT(*) as count FROM notes")
        total_notes = (await cursor.fetchone())["count"]

        # Total reading hours
        cursor = await db.execute("""
            SELECT SUM(
                CASE
                    WHEN end_time IS NOT NULL
                    THEN (julianday(end_time) - julianday(start_time)) * 24
                    ELSE 0
                END
            ) as hours
            FROM reading_sessions
        """)
        result = await cursor.fetchone()
        total_hours = result["hours"] or 0

        # Recent additions (last 30 days)
        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
        cursor = await db.execute(
            "SELECT COUNT(*) as count FROM references WHERE created_at >= ?",
            [thirty_days_ago]
        )
        recent = (await cursor.fetchone())["count"]

        # Favorites
        cursor = await db.execute("SELECT COUNT(*) as count FROM references WHERE is_favorite = 1")
        favorites = (await cursor.fetchone())["count"]

        return {
            "total_references": total,
            "by_type": by_type,
            "by_year": by_year,
            "by_language": by_language,
            "by_read_status": by_read_status,
            "total_annotations": total_annotations,
            "total_notes": total_notes,
            "total_reading_hours": round(total_hours, 2),
            "recent_additions": recent,
            "favorites_count": favorites,
        }
    finally:
        await db.close()


@router.get("/reading", response_model=ReadingStats)
async def get_reading_stats():
    """Get reading statistics"""
    db = await get_db()
    try:
        # Total sessions
        cursor = await db.execute("SELECT COUNT(*) as count FROM reading_sessions")
        total_sessions = (await cursor.fetchone())["count"]

        # Total hours
        cursor = await db.execute("""
            SELECT SUM(
                CASE
                    WHEN end_time IS NOT NULL
                    THEN (julianday(end_time) - julianday(start_time)) * 24
                    ELSE 0
                END
            ) as hours
            FROM reading_sessions
        """)
        result = await cursor.fetchone()
        total_hours = result["hours"] or 0

        # Total pages
        cursor = await db.execute("SELECT SUM(pages_read) as pages FROM reading_sessions")
        result = await cursor.fetchone()
        pages_read = result["pages"] or 0

        # Average session
        cursor = await db.execute("""
            SELECT AVG(
                CASE
                    WHEN end_time IS NOT NULL
                    THEN (julianday(end_time) - julianday(start_time)) * 24 * 60
                    ELSE 0
                END
            ) as avg_minutes
            FROM reading_sessions
        """)
        result = await cursor.fetchone()
        avg_minutes = result["avg_minutes"] or 0

        # By month (last 6 months)
        cursor = await db.execute("""
            SELECT
                strftime('%Y-%m', start_time) as month,
                COUNT(*) as sessions,
                SUM(pages_read) as pages,
                SUM(
                    CASE
                        WHEN end_time IS NOT NULL
                        THEN (julianday(end_time) - julianday(start_time)) * 24
                        ELSE 0
                    END
                ) as hours
            FROM reading_sessions
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6
        """)
        by_month = [dict(row) for row in await cursor.fetchall()]

        return {
            "total_sessions": total_sessions,
            "total_hours": round(total_hours, 2),
            "pages_read": pages_read,
            "average_session_minutes": round(avg_minutes, 2),
            "by_month": by_month,
        }
    finally:
        await db.close()


@router.get("/authors/top")
async def get_top_authors(limit: int = 10):
    """Get most referenced authors"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT a.*, COUNT(ra.reference_id) as references_count
            FROM authors a
            JOIN reference_authors ra ON a.id = ra.author_id
            GROUP BY a.id
            ORDER BY references_count DESC
            LIMIT ?
        """, [limit])
        return [dict(row) for row in await cursor.fetchall()]
    finally:
        await db.close()


@router.get("/tags/top")
async def get_top_tags(limit: int = 10):
    """Get most used tags"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT t.*, COUNT(rt.reference_id) as references_count
            FROM tags t
            JOIN reference_tags rt ON t.id = rt.tag_id
            GROUP BY t.id
            ORDER BY references_count DESC
            LIMIT ?
        """, [limit])
        return [dict(row) for row in await cursor.fetchall()]
    finally:
        await db.close()


@router.get("/activity")
async def get_activity_timeline(days: int = 30):
    """Get activity timeline"""
    db = await get_db()
    try:
        start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()

        # References added
        cursor = await db.execute("""
            SELECT date(created_at) as date, COUNT(*) as references_added
            FROM references
            WHERE created_at >= ?
            GROUP BY date(created_at)
            ORDER BY date
        """, [start_date])
        refs = {row["date"]: row["references_added"] for row in await cursor.fetchall()}

        # Annotations added
        cursor = await db.execute("""
            SELECT date(created_at) as date, COUNT(*) as annotations_added
            FROM annotations
            WHERE created_at >= ?
            GROUP BY date(created_at)
            ORDER BY date
        """, [start_date])
        annotations = {row["date"]: row["annotations_added"] for row in await cursor.fetchall()}

        # Reading sessions
        cursor = await db.execute("""
            SELECT date(start_time) as date, COUNT(*) as sessions
            FROM reading_sessions
            WHERE start_time >= ?
            GROUP BY date(start_time)
            ORDER BY date
        """, [start_date])
        sessions = {row["date"]: row["sessions"] for row in await cursor.fetchall()}

        # Combine
        all_dates = set(refs.keys()) | set(annotations.keys()) | set(sessions.keys())
        timeline = []
        for date in sorted(all_dates):
            timeline.append({
                "date": date,
                "references_added": refs.get(date, 0),
                "annotations_added": annotations.get(date, 0),
                "reading_sessions": sessions.get(date, 0),
            })

        return timeline
    finally:
        await db.close()
