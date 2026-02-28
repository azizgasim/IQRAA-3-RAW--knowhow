"""
Zotero Smart - Database Layer
قاعدة بيانات إدارة المراجع الذكية
"""

import aiosqlite
import os
from datetime import datetime

DATABASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'zotero_smart.db')


async def get_db():
    """Get database connection"""
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    return db


async def init_database():
    """Initialize database with all tables"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Enable foreign keys
        await db.execute("PRAGMA foreign_keys = ON")

        # 1. references - المراجع الببليوغرافية
        await db.execute("""
            CREATE TABLE IF NOT EXISTS references (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                title_ar TEXT,
                authors TEXT,
                authors_ar TEXT,
                year INTEGER,
                hijri_year TEXT,
                type TEXT DEFAULT 'book',
                publisher TEXT,
                journal TEXT,
                volume TEXT,
                issue TEXT,
                pages TEXT,
                doi TEXT,
                isbn TEXT,
                url TEXT,
                abstract TEXT,
                abstract_ar TEXT,
                language TEXT DEFAULT 'ar',
                citation_key TEXT UNIQUE,
                bibtex TEXT,
                zotero_key TEXT,
                pdf_path TEXT,
                cover_image TEXT,
                is_favorite BOOLEAN DEFAULT 0,
                is_archived BOOLEAN DEFAULT 0,
                read_status TEXT DEFAULT 'unread',
                rating INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 2. collections - المجموعات/التصنيفات
        await db.execute("""
            CREATE TABLE IF NOT EXISTS collections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                name_ar TEXT,
                description TEXT,
                parent_id INTEGER,
                color TEXT DEFAULT '#10b981',
                icon TEXT DEFAULT 'folder',
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES collections(id) ON DELETE SET NULL
            )
        """)

        # 3. reference_collections - العلاقة بين المراجع والمجموعات
        await db.execute("""
            CREATE TABLE IF NOT EXISTS reference_collections (
                reference_id INTEGER NOT NULL,
                collection_id INTEGER NOT NULL,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (reference_id, collection_id),
                FOREIGN KEY (reference_id) REFERENCES references(id) ON DELETE CASCADE,
                FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
            )
        """)

        # 4. tags - الوسوم
        await db.execute("""
            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                color TEXT DEFAULT '#6b7280',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 5. reference_tags - العلاقة بين المراجع والوسوم
        await db.execute("""
            CREATE TABLE IF NOT EXISTS reference_tags (
                reference_id INTEGER NOT NULL,
                tag_id INTEGER NOT NULL,
                PRIMARY KEY (reference_id, tag_id),
                FOREIGN KEY (reference_id) REFERENCES references(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            )
        """)

        # 6. annotations - التعليقات والتظليلات
        await db.execute("""
            CREATE TABLE IF NOT EXISTS annotations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reference_id INTEGER NOT NULL,
                type TEXT DEFAULT 'highlight',
                content TEXT,
                comment TEXT,
                page_number INTEGER,
                position_data TEXT,
                color TEXT DEFAULT '#fef08a',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (reference_id) REFERENCES references(id) ON DELETE CASCADE
            )
        """)

        # 7. notes - ملاحظات المراجع
        await db.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reference_id INTEGER NOT NULL,
                title TEXT,
                content TEXT NOT NULL,
                note_type TEXT DEFAULT 'general',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (reference_id) REFERENCES references(id) ON DELETE CASCADE
            )
        """)

        # 8. citations - الاقتباسات المُنسّقة
        await db.execute("""
            CREATE TABLE IF NOT EXISTS citations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reference_id INTEGER NOT NULL,
                style TEXT NOT NULL,
                formatted_citation TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (reference_id) REFERENCES references(id) ON DELETE CASCADE
            )
        """)

        # 9. related_references - العلاقات بين المراجع
        await db.execute("""
            CREATE TABLE IF NOT EXISTS related_references (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_id INTEGER NOT NULL,
                target_id INTEGER NOT NULL,
                relation_type TEXT DEFAULT 'related',
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_id) REFERENCES references(id) ON DELETE CASCADE,
                FOREIGN KEY (target_id) REFERENCES references(id) ON DELETE CASCADE
            )
        """)

        # 10. authors - المؤلفون
        await db.execute("""
            CREATE TABLE IF NOT EXISTS authors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                name_ar TEXT,
                orcid TEXT,
                affiliation TEXT,
                bio TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 11. reference_authors - العلاقة بين المراجع والمؤلفين
        await db.execute("""
            CREATE TABLE IF NOT EXISTS reference_authors (
                reference_id INTEGER NOT NULL,
                author_id INTEGER NOT NULL,
                author_order INTEGER DEFAULT 1,
                role TEXT DEFAULT 'author',
                PRIMARY KEY (reference_id, author_id),
                FOREIGN KEY (reference_id) REFERENCES references(id) ON DELETE CASCADE,
                FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
            )
        """)

        # 12. reading_sessions - جلسات القراءة
        await db.execute("""
            CREATE TABLE IF NOT EXISTS reading_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reference_id INTEGER NOT NULL,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP,
                pages_read INTEGER DEFAULT 0,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (reference_id) REFERENCES references(id) ON DELETE CASCADE
            )
        """)

        # 13. sync_log - سجل المزامنة
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sync_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_type TEXT NOT NULL,
                entity_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                synced_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 14. import_history - سجل الاستيراد
        await db.execute("""
            CREATE TABLE IF NOT EXISTS import_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                file_name TEXT,
                items_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'completed',
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create FTS5 virtual table for full-text search
        await db.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS references_fts USING fts5(
                title,
                title_ar,
                authors,
                authors_ar,
                abstract,
                abstract_ar,
                content='references',
                content_rowid='id'
            )
        """)

        # Triggers to keep FTS in sync
        await db.execute("""
            CREATE TRIGGER IF NOT EXISTS references_ai AFTER INSERT ON references BEGIN
                INSERT INTO references_fts(rowid, title, title_ar, authors, authors_ar, abstract, abstract_ar)
                VALUES (new.id, new.title, new.title_ar, new.authors, new.authors_ar, new.abstract, new.abstract_ar);
            END
        """)

        await db.execute("""
            CREATE TRIGGER IF NOT EXISTS references_ad AFTER DELETE ON references BEGIN
                INSERT INTO references_fts(references_fts, rowid, title, title_ar, authors, authors_ar, abstract, abstract_ar)
                VALUES ('delete', old.id, old.title, old.title_ar, old.authors, old.authors_ar, old.abstract, old.abstract_ar);
            END
        """)

        await db.execute("""
            CREATE TRIGGER IF NOT EXISTS references_au AFTER UPDATE ON references BEGIN
                INSERT INTO references_fts(references_fts, rowid, title, title_ar, authors, authors_ar, abstract, abstract_ar)
                VALUES ('delete', old.id, old.title, old.title_ar, old.authors, old.authors_ar, old.abstract, old.abstract_ar);
                INSERT INTO references_fts(rowid, title, title_ar, authors, authors_ar, abstract, abstract_ar)
                VALUES (new.id, new.title, new.title_ar, new.authors, new.authors_ar, new.abstract, new.abstract_ar);
            END
        """)

        # Create indexes for better performance
        await db.execute("CREATE INDEX IF NOT EXISTS idx_references_year ON references(year)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_references_type ON references(type)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_references_language ON references(language)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_references_read_status ON references(read_status)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_annotations_reference ON annotations(reference_id)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_notes_reference ON notes(reference_id)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_reading_sessions_reference ON reading_sessions(reference_id)")

        await db.commit()
        print("✅ Zotero Smart database initialized successfully!")


async def close_database(db):
    """Close database connection"""
    await db.close()
