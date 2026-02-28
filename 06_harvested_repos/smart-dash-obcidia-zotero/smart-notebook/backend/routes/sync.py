"""
Sync Routes - مسارات المزامنة والنسخ الاحتياطي
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import List
from datetime import datetime
import json
import os

from database.db import get_db
from models.schemas import SyncStatus, SyncLog

router = APIRouter(prefix="/sync", tags=["Sync"])

BACKUP_DIR = os.environ.get("OBSIDIA_BACKUP_DIR", "backups")


@router.get("/status", response_model=SyncStatus)
async def get_sync_status():
    """Get current sync status"""
    db = await get_db()
    try:
        # Get last local backup
        cursor = await db.execute("""
            SELECT completed_at FROM sync_log
            WHERE sync_type = 'local' AND status = 'completed'
            ORDER BY completed_at DESC LIMIT 1
        """)
        local_backup = await cursor.fetchone()

        # Get last BigQuery sync
        cursor = await db.execute("""
            SELECT completed_at FROM sync_log
            WHERE sync_type = 'bigquery' AND status = 'completed'
            ORDER BY completed_at DESC LIMIT 1
        """)
        bigquery_sync = await cursor.fetchone()

        # Count changes since last sync
        last_sync = local_backup["completed_at"] if local_backup else "2000-01-01"
        cursor = await db.execute("""
            SELECT COUNT(*) as count FROM notes WHERE updated_at > ?
        """, (last_sync,))
        pending = (await cursor.fetchone())["count"]

        return SyncStatus(
            last_local_backup=local_backup["completed_at"] if local_backup else None,
            last_bigquery_sync=bigquery_sync["completed_at"] if bigquery_sync else None,
            pending_changes=pending,
            is_syncing=False
        )
    finally:
        await db.close()


@router.post("/backup/local")
async def backup_local():
    """Create local JSON backup"""
    db = await get_db()
    try:
        now = datetime.now()
        started_at = now.isoformat()

        # Create sync log entry
        cursor = await db.execute(
            """INSERT INTO sync_log (sync_type, status, started_at)
               VALUES ('local', 'in_progress', ?)""",
            (started_at,)
        )
        log_id = cursor.lastrowid

        try:
            # Export all data
            backup_data = {
                "exported_at": started_at,
                "version": "1.0.0",
                "notes": [],
                "tags": [],
                "projects": [],
                "questions": [],
                "quotations": [],
                "links": [],
                "decisions": [],
                "milestones": [],
                "cognitive_profile": []
            }

            # Notes
            cursor = await db.execute("SELECT * FROM notes")
            notes = await cursor.fetchall()
            backup_data["notes"] = [dict(n) for n in notes]

            # Note tags
            cursor = await db.execute("""
                SELECT n.id as note_id, GROUP_CONCAT(t.name) as tags
                FROM notes n
                LEFT JOIN note_tags nt ON n.id = nt.note_id
                LEFT JOIN tags t ON nt.tag_id = t.id
                GROUP BY n.id
            """)
            note_tags = await cursor.fetchall()
            note_tags_map = {nt["note_id"]: nt["tags"].split(",") if nt["tags"] else [] for nt in note_tags}
            for note in backup_data["notes"]:
                note["tags"] = note_tags_map.get(note["id"], [])

            # Tags
            cursor = await db.execute("SELECT * FROM tags")
            tags = await cursor.fetchall()
            backup_data["tags"] = [dict(t) for t in tags]

            # Projects
            cursor = await db.execute("SELECT * FROM projects")
            projects = await cursor.fetchall()
            backup_data["projects"] = [dict(p) for p in projects]

            # Questions
            cursor = await db.execute("SELECT * FROM questions")
            questions = await cursor.fetchall()
            backup_data["questions"] = [dict(q) for q in questions]

            # Quotations
            cursor = await db.execute("SELECT * FROM quotations")
            quotations = await cursor.fetchall()
            backup_data["quotations"] = [dict(q) for q in quotations]

            # Links
            cursor = await db.execute("SELECT * FROM links")
            links = await cursor.fetchall()
            backup_data["links"] = [dict(l) for l in links]

            # Decisions
            cursor = await db.execute("SELECT * FROM decisions")
            decisions = await cursor.fetchall()
            backup_data["decisions"] = [dict(d) for d in decisions]

            # Milestones
            cursor = await db.execute("SELECT * FROM journey_milestones")
            milestones = await cursor.fetchall()
            backup_data["milestones"] = [dict(m) for m in milestones]

            # Cognitive profile
            cursor = await db.execute("SELECT * FROM cognitive_profile")
            profiles = await cursor.fetchall()
            backup_data["cognitive_profile"] = [dict(p) for p in profiles]

            # Ensure backup directory exists
            os.makedirs(BACKUP_DIR, exist_ok=True)

            # Write backup file
            filename = f"obsidia_backup_{now.strftime('%Y%m%d_%H%M%S')}.json"
            filepath = os.path.join(BACKUP_DIR, filename)

            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=2)

            # Update sync log
            items_count = sum(len(v) for k, v in backup_data.items() if isinstance(v, list))
            completed_at = datetime.now().isoformat()

            await db.execute(
                """UPDATE sync_log SET status = 'completed', items_synced = ?, completed_at = ?
                   WHERE id = ?""",
                (items_count, completed_at, log_id)
            )
            await db.commit()

            return {
                "message": "Backup completed successfully",
                "filename": filename,
                "items_synced": items_count
            }

        except Exception as e:
            await db.execute(
                """UPDATE sync_log SET status = 'failed', error_message = ? WHERE id = ?""",
                (str(e), log_id)
            )
            await db.commit()
            raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

    finally:
        await db.close()


@router.post("/backup/bigquery")
async def backup_bigquery():
    """Sync to BigQuery (placeholder - requires Google Cloud setup)"""
    db = await get_db()
    try:
        started_at = datetime.now().isoformat()

        # Create sync log entry
        cursor = await db.execute(
            """INSERT INTO sync_log (sync_type, status, started_at)
               VALUES ('bigquery', 'in_progress', ?)""",
            (started_at,)
        )
        log_id = cursor.lastrowid

        # In a real implementation, this would:
        # 1. Connect to BigQuery using google-cloud-bigquery
        # 2. Upload data to obsidia_* tables
        # 3. Update sync log

        # For now, mark as completed (placeholder)
        completed_at = datetime.now().isoformat()
        await db.execute(
            """UPDATE sync_log SET status = 'completed', items_synced = 0,
               error_message = 'BigQuery integration not configured', completed_at = ?
               WHERE id = ?""",
            (completed_at, log_id)
        )
        await db.commit()

        return {
            "message": "BigQuery sync placeholder - configure Google Cloud credentials to enable",
            "status": "completed"
        }
    finally:
        await db.close()


@router.post("/export/json")
async def export_to_json():
    """Export all data to JSON (same as local backup but returns the data)"""
    db = await get_db()
    try:
        export_data = {
            "exported_at": datetime.now().isoformat(),
            "version": "1.0.0"
        }

        # Notes with tags
        cursor = await db.execute("SELECT * FROM notes")
        notes = await cursor.fetchall()
        notes_list = [dict(n) for n in notes]

        cursor = await db.execute("""
            SELECT n.id as note_id, GROUP_CONCAT(t.name) as tags
            FROM notes n
            LEFT JOIN note_tags nt ON n.id = nt.note_id
            LEFT JOIN tags t ON nt.tag_id = t.id
            GROUP BY n.id
        """)
        note_tags = await cursor.fetchall()
        note_tags_map = {nt["note_id"]: nt["tags"].split(",") if nt["tags"] else [] for nt in note_tags}
        for note in notes_list:
            note["tags"] = note_tags_map.get(note["id"], [])

        export_data["notes"] = notes_list

        # Projects with questions
        cursor = await db.execute("SELECT * FROM projects")
        projects = await cursor.fetchall()
        export_data["projects"] = [dict(p) for p in projects]

        cursor = await db.execute("SELECT * FROM questions")
        questions = await cursor.fetchall()
        export_data["questions"] = [dict(q) for q in questions]

        return JSONResponse(content=export_data)
    finally:
        await db.close()


@router.get("/history", response_model=List[SyncLog])
async def get_sync_history():
    """Get sync history"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT * FROM sync_log ORDER BY started_at DESC LIMIT 20
        """)
        logs = await cursor.fetchall()
        return [dict(log) for log in logs]
    finally:
        await db.close()


@router.post("/restore/{backup_filename}")
async def restore_backup(backup_filename: str):
    """Restore from a local backup file"""
    filepath = os.path.join(BACKUP_DIR, backup_filename)

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Backup file not found")

    db = await get_db()
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            backup_data = json.load(f)

        # This is a simplified restore - in production, you'd want more careful handling
        # For now, we'll just return info about what would be restored

        return {
            "message": "Restore preview",
            "backup_date": backup_data.get("exported_at"),
            "items": {
                "notes": len(backup_data.get("notes", [])),
                "tags": len(backup_data.get("tags", [])),
                "projects": len(backup_data.get("projects", [])),
                "questions": len(backup_data.get("questions", []))
            },
            "warning": "Full restore functionality requires confirmation. Contact admin to proceed."
        }
    finally:
        await db.close()
