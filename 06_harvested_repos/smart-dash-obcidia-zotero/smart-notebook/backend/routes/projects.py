"""
Projects Routes - مسارات المشاريع البحثية
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from database.db import get_db
from models.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    QuestionCreate, QuestionUpdate, QuestionResponse,
    DecisionCreate, DecisionResponse,
    MilestoneCreate, MilestoneResponse
)

router = APIRouter(prefix="/projects", tags=["Projects"])


# ===== Projects =====

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(
    status: Optional[str] = None,
    limit: int = Query(default=50, ge=1, le=200)
):
    """Get all projects"""
    db = await get_db()
    try:
        query = """
            SELECT p.*,
                   (SELECT COUNT(*) FROM notes WHERE project_id = p.id) as notes_count,
                   (SELECT COUNT(*) FROM questions WHERE project_id = p.id) as questions_count
            FROM projects p
        """
        params = []

        if status:
            query += " WHERE p.status = ?"
            params.append(status)

        query += " ORDER BY p.updated_at DESC LIMIT ?"
        params.append(limit)

        cursor = await db.execute(query, params)
        projects = await cursor.fetchall()
        return [dict(p) for p in projects]
    finally:
        await db.close()


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int):
    """Get a specific project"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT p.*,
                   (SELECT COUNT(*) FROM notes WHERE project_id = p.id) as notes_count,
                   (SELECT COUNT(*) FROM questions WHERE project_id = p.id) as questions_count
            FROM projects p WHERE p.id = ?
        """, (project_id,))
        project = await cursor.fetchone()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        return dict(project)
    finally:
        await db.close()


@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    """Create a new project"""
    db = await get_db()
    try:
        now = datetime.now().isoformat()
        cursor = await db.execute(
            """INSERT INTO projects (name, description, color, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?)""",
            (project.name, project.description, project.color, now, now)
        )
        project_id = cursor.lastrowid
        await db.commit()

        cursor = await db.execute("""
            SELECT p.*, 0 as notes_count, 0 as questions_count
            FROM projects p WHERE p.id = ?
        """, (project_id,))
        return dict(await cursor.fetchone())
    finally:
        await db.close()


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, project: ProjectUpdate):
    """Update a project"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Project not found")

        now = datetime.now().isoformat()
        updates = ["updated_at = ?"]
        params = [now]

        if project.name is not None:
            updates.append("name = ?")
            params.append(project.name)
        if project.description is not None:
            updates.append("description = ?")
            params.append(project.description)
        if project.color is not None:
            updates.append("color = ?")
            params.append(project.color)
        if project.status is not None:
            updates.append("status = ?")
            params.append(project.status)

        params.append(project_id)
        await db.execute(
            f"UPDATE projects SET {', '.join(updates)} WHERE id = ?",
            params
        )
        await db.commit()

        cursor = await db.execute("""
            SELECT p.*,
                   (SELECT COUNT(*) FROM notes WHERE project_id = p.id) as notes_count,
                   (SELECT COUNT(*) FROM questions WHERE project_id = p.id) as questions_count
            FROM projects p WHERE p.id = ?
        """, (project_id,))
        return dict(await cursor.fetchone())
    finally:
        await db.close()


@router.delete("/{project_id}")
async def delete_project(project_id: int):
    """Delete a project"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Project not found")

        await db.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        await db.commit()

        return {"message": "Project deleted successfully"}
    finally:
        await db.close()


@router.get("/{project_id}/journey")
async def get_project_journey(project_id: int):
    """Get the research journey for a project"""
    db = await get_db()
    try:
        # Get milestones
        cursor = await db.execute("""
            SELECT * FROM journey_milestones
            WHERE project_id = ?
            ORDER BY created_at ASC
        """, (project_id,))
        milestones = await cursor.fetchall()

        # Get key decisions
        cursor = await db.execute("""
            SELECT * FROM decisions
            WHERE project_id = ?
            ORDER BY created_at ASC
        """, (project_id,))
        decisions = await cursor.fetchall()

        # Get resolved questions
        cursor = await db.execute("""
            SELECT * FROM questions
            WHERE project_id = ? AND status = 'resolved'
            ORDER BY resolved_at ASC
        """, (project_id,))
        resolved_questions = await cursor.fetchall()

        return {
            "milestones": [dict(m) for m in milestones],
            "decisions": [dict(d) for d in decisions],
            "resolved_questions": [dict(q) for q in resolved_questions]
        }
    finally:
        await db.close()


# ===== Questions =====

@router.get("/{project_id}/questions", response_model=List[QuestionResponse])
async def get_project_questions(
    project_id: int,
    status: Optional[str] = None,
    parent_id: Optional[int] = None
):
    """Get questions for a project"""
    db = await get_db()
    try:
        query = """
            SELECT q.*,
                   (SELECT COUNT(*) FROM questions WHERE parent_id = q.id) as children_count
            FROM questions q
            WHERE q.project_id = ?
        """
        params = [project_id]

        if status:
            query += " AND q.status = ?"
            params.append(status)
        if parent_id is not None:
            query += " AND q.parent_id = ?"
            params.append(parent_id)
        else:
            query += " AND q.parent_id IS NULL"

        query += " ORDER BY q.priority DESC, q.created_at DESC"

        cursor = await db.execute(query, params)
        questions = await cursor.fetchall()
        return [dict(q) for q in questions]
    finally:
        await db.close()


@router.post("/{project_id}/questions", response_model=QuestionResponse)
async def create_question(project_id: int, question: QuestionCreate):
    """Create a new question"""
    db = await get_db()
    try:
        # Verify project exists
        cursor = await db.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Project not found")

        now = datetime.now().isoformat()
        cursor = await db.execute(
            """INSERT INTO questions (project_id, parent_id, content, priority, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (project_id, question.parent_id, question.content, question.priority, now)
        )
        question_id = cursor.lastrowid

        # Update cognitive profile
        today = datetime.now().strftime("%Y-%m-%d")
        await db.execute("""
            INSERT INTO cognitive_profile (date, questions_asked)
            VALUES (?, 1)
            ON CONFLICT(date) DO UPDATE SET questions_asked = questions_asked + 1
        """, (today,))

        await db.commit()

        cursor = await db.execute("""
            SELECT q.*, 0 as children_count FROM questions q WHERE q.id = ?
        """, (question_id,))
        return dict(await cursor.fetchone())
    finally:
        await db.close()


@router.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(question_id: int, question: QuestionUpdate):
    """Update a question"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id, status FROM questions WHERE id = ?", (question_id,))
        existing = await cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Question not found")

        updates = []
        params = []

        if question.content is not None:
            updates.append("content = ?")
            params.append(question.content)
        if question.status is not None:
            updates.append("status = ?")
            params.append(question.status)
            if question.status == "resolved" and existing["status"] != "resolved":
                updates.append("resolved_at = ?")
                params.append(datetime.now().isoformat())

                # Update cognitive profile
                today = datetime.now().strftime("%Y-%m-%d")
                await db.execute("""
                    INSERT INTO cognitive_profile (date, questions_resolved)
                    VALUES (?, 1)
                    ON CONFLICT(date) DO UPDATE SET questions_resolved = questions_resolved + 1
                """, (today,))
        if question.priority is not None:
            updates.append("priority = ?")
            params.append(question.priority)
        if question.answer is not None:
            updates.append("answer = ?")
            params.append(question.answer)

        if updates:
            params.append(question_id)
            await db.execute(
                f"UPDATE questions SET {', '.join(updates)} WHERE id = ?",
                params
            )
            await db.commit()

        cursor = await db.execute("""
            SELECT q.*,
                   (SELECT COUNT(*) FROM questions WHERE parent_id = q.id) as children_count
            FROM questions q WHERE q.id = ?
        """, (question_id,))
        return dict(await cursor.fetchone())
    finally:
        await db.close()


@router.post("/questions/{question_id}/branch", response_model=QuestionResponse)
async def branch_question(question_id: int, sub_question: QuestionCreate):
    """Create a sub-question (branch) from an existing question"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT project_id FROM questions WHERE id = ?", (question_id,))
        parent = await cursor.fetchone()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent question not found")

        now = datetime.now().isoformat()
        cursor = await db.execute(
            """INSERT INTO questions (project_id, parent_id, content, priority, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (parent["project_id"], question_id, sub_question.content, sub_question.priority, now)
        )
        new_question_id = cursor.lastrowid
        await db.commit()

        cursor = await db.execute("""
            SELECT q.*, 0 as children_count FROM questions q WHERE q.id = ?
        """, (new_question_id,))
        return dict(await cursor.fetchone())
    finally:
        await db.close()


# ===== Decisions =====

@router.get("/{project_id}/decisions", response_model=List[DecisionResponse])
async def get_project_decisions(project_id: int):
    """Get decisions for a project"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT * FROM decisions WHERE project_id = ?
            ORDER BY created_at DESC
        """, (project_id,))
        decisions = await cursor.fetchall()
        return [dict(d) for d in decisions]
    finally:
        await db.close()


@router.post("/{project_id}/decisions", response_model=DecisionResponse)
async def create_decision(project_id: int, decision: DecisionCreate):
    """Record a research decision"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Project not found")

        now = datetime.now().isoformat()
        cursor = await db.execute(
            """INSERT INTO decisions (project_id, title, reasoning, alternatives, outcome, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (project_id, decision.title, decision.reasoning, decision.alternatives, decision.outcome, now)
        )
        decision_id = cursor.lastrowid
        await db.commit()

        cursor = await db.execute("SELECT * FROM decisions WHERE id = ?", (decision_id,))
        return dict(await cursor.fetchone())
    finally:
        await db.close()


# ===== Milestones =====

@router.get("/{project_id}/milestones", response_model=List[MilestoneResponse])
async def get_project_milestones(project_id: int):
    """Get milestones for a project"""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT * FROM journey_milestones WHERE project_id = ?
            ORDER BY created_at DESC
        """, (project_id,))
        milestones = await cursor.fetchall()
        return [dict(m) for m in milestones]
    finally:
        await db.close()


@router.post("/{project_id}/milestones", response_model=MilestoneResponse)
async def create_milestone(project_id: int, milestone: MilestoneCreate):
    """Record a research milestone"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Project not found")

        now = datetime.now().isoformat()
        cursor = await db.execute(
            """INSERT INTO journey_milestones
               (project_id, title, description, milestone_type, significance, related_note_id, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (project_id, milestone.title, milestone.description, milestone.milestone_type,
             milestone.significance, milestone.related_note_id, now)
        )
        milestone_id = cursor.lastrowid
        await db.commit()

        cursor = await db.execute("SELECT * FROM journey_milestones WHERE id = ?", (milestone_id,))
        return dict(await cursor.fetchone())
    finally:
        await db.close()
