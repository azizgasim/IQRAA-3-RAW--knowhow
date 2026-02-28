"""
Obsidia Database - قاعدة بيانات المفكرة الذكية
SQLite + aiosqlite with FTS5 for search
"""

import aiosqlite
import os
from datetime import datetime
from typing import Optional
import json

DATABASE_PATH = os.environ.get("OBSIDIA_DB_PATH", "obsidia.db")


async def get_db():
    """Get database connection"""
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA foreign_keys = ON")
    return db


async def init_database():
    """Initialize database with all tables"""
    db = await get_db()

    try:
        # ===== 1. Notes Table =====
        await db.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                source TEXT DEFAULT 'manual',
                source_ref TEXT,
                project_id INTEGER,
                is_favorite INTEGER DEFAULT 0,
                is_archived INTEGER DEFAULT 0,
                review_count INTEGER DEFAULT 0,
                next_review_date TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
            )
        """)

        # FTS5 for full-text search
        await db.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
                title, content, content=notes, content_rowid=id
            )
        """)

        # Triggers to keep FTS in sync
        await db.execute("""
            CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
                INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
            END
        """)

        await db.execute("""
            CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
                INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
            END
        """)

        await db.execute("""
            CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
                INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
                INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
            END
        """)

        # ===== 2. Tags Table =====
        await db.execute("""
            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                color TEXT DEFAULT '#3B82F6',
                usage_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # ===== 3. Note-Tags Relation (M:M) =====
        await db.execute("""
            CREATE TABLE IF NOT EXISTS note_tags (
                note_id INTEGER NOT NULL,
                tag_id INTEGER NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (note_id, tag_id),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            )
        """)

        # ===== 4. Links Table (Wiki-style links) =====
        await db.execute("""
            CREATE TABLE IF NOT EXISTS links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_note_id INTEGER NOT NULL,
                target_note_id INTEGER,
                target_title TEXT NOT NULL,
                context TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (target_note_id) REFERENCES notes(id) ON DELETE SET NULL
            )
        """)

        # ===== 5. Projects Table =====
        await db.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                color TEXT DEFAULT '#3B82F6',
                status TEXT DEFAULT 'active',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # ===== 6. Questions Table =====
        await db.execute("""
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                parent_id INTEGER,
                content TEXT NOT NULL,
                status TEXT DEFAULT 'open',
                priority INTEGER DEFAULT 0,
                answer TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                resolved_at TEXT,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES questions(id) ON DELETE SET NULL
            )
        """)

        # ===== 7. Quotations Table =====
        await db.execute("""
            CREATE TABLE IF NOT EXISTS quotations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_id INTEGER,
                content TEXT NOT NULL,
                source_title TEXT,
                source_author TEXT,
                source_ref TEXT,
                page_number TEXT,
                tags TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL
            )
        """)

        # ===== 8. Cognitive Profile Table =====
        await db.execute("""
            CREATE TABLE IF NOT EXISTS cognitive_profile (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT UNIQUE NOT NULL,
                notes_created INTEGER DEFAULT 0,
                notes_edited INTEGER DEFAULT 0,
                links_created INTEGER DEFAULT 0,
                questions_asked INTEGER DEFAULT 0,
                questions_resolved INTEGER DEFAULT 0,
                active_time_minutes INTEGER DEFAULT 0,
                peak_hour INTEGER,
                primary_project_id INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (primary_project_id) REFERENCES projects(id) ON DELETE SET NULL
            )
        """)

        # ===== 9. Reminders Table =====
        await db.execute("""
            CREATE TABLE IF NOT EXISTS reminders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_id INTEGER,
                content TEXT NOT NULL,
                reminder_type TEXT DEFAULT 'note',
                due_date TEXT NOT NULL,
                is_completed INTEGER DEFAULT 0,
                completed_at TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
            )
        """)

        # ===== 10. Sync Log Table =====
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sync_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sync_type TEXT NOT NULL,
                status TEXT NOT NULL,
                items_synced INTEGER DEFAULT 0,
                error_message TEXT,
                started_at TEXT DEFAULT CURRENT_TIMESTAMP,
                completed_at TEXT
            )
        """)

        # ===== 11. Decisions Table =====
        await db.execute("""
            CREATE TABLE IF NOT EXISTS decisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                reasoning TEXT,
                alternatives TEXT,
                outcome TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        """)

        # ===== 12. Journey Milestones Table =====
        await db.execute("""
            CREATE TABLE IF NOT EXISTS journey_milestones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                milestone_type TEXT DEFAULT 'discovery',
                significance INTEGER DEFAULT 5,
                related_note_id INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (related_note_id) REFERENCES notes(id) ON DELETE SET NULL
            )
        """)

        # ===== Indexes for Performance =====
        await db.execute("CREATE INDEX IF NOT EXISTS idx_notes_project ON notes(project_id)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_links_source ON links(source_note_id)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_note_id)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_questions_project ON questions(project_id)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(due_date)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_cognitive_date ON cognitive_profile(date)")

        await db.commit()
        print("Database initialized successfully with 12 tables")

    finally:
        await db.close()


async def close_database(db: aiosqlite.Connection):
    """Close database connection"""
    await db.close()
