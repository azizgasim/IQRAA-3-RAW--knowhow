"""
Obsidia Pydantic Models - نماذج البيانات
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ===== Enums =====

class ProjectStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class QuestionStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    DEFERRED = "deferred"


class NoteSource(str, Enum):
    MANUAL = "manual"
    VOICE = "voice"
    WHATSAPP = "whatsapp"
    IQRA = "iqra"


class MilestoneType(str, Enum):
    DISCOVERY = "discovery"
    INSIGHT = "insight"
    DECISION = "decision"
    BREAKTHROUGH = "breakthrough"
    PIVOT = "pivot"


class MomentumTrend(str, Enum):
    RISING = "rising"
    STABLE = "stable"
    DECLINING = "declining"


# ===== Note Models =====

class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1)
    source: NoteSource = NoteSource.MANUAL
    source_ref: Optional[str] = None
    project_id: Optional[int] = None


class NoteCreate(NoteBase):
    tags: List[str] = []


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = Field(None, min_length=1)
    project_id: Optional[int] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None
    tags: Optional[List[str]] = None


class NoteResponse(NoteBase):
    id: int
    is_favorite: bool = False
    is_archived: bool = False
    review_count: int = 0
    next_review_date: Optional[str] = None
    created_at: str
    updated_at: str
    tags: List[str] = []
    links_count: int = 0
    backlinks_count: int = 0

    class Config:
        from_attributes = True


# ===== Tag Models =====

class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(default="#3B82F6", pattern="^#[0-9A-Fa-f]{6}$")


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: int
    usage_count: int = 0
    created_at: str

    class Config:
        from_attributes = True


# ===== Project Models =====

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    color: str = Field(default="#3B82F6", pattern="^#[0-9A-Fa-f]{6}$")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    status: Optional[ProjectStatus] = None


class ProjectResponse(ProjectBase):
    id: int
    status: ProjectStatus = ProjectStatus.ACTIVE
    created_at: str
    updated_at: str
    notes_count: int = 0
    questions_count: int = 0

    class Config:
        from_attributes = True


# ===== Question Models =====

class QuestionBase(BaseModel):
    content: str = Field(..., min_length=1)
    priority: int = Field(default=0, ge=0, le=10)


class QuestionCreate(QuestionBase):
    parent_id: Optional[int] = None


class QuestionUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1)
    status: Optional[QuestionStatus] = None
    priority: Optional[int] = Field(None, ge=0, le=10)
    answer: Optional[str] = None


class QuestionResponse(QuestionBase):
    id: int
    project_id: int
    parent_id: Optional[int] = None
    status: QuestionStatus = QuestionStatus.OPEN
    answer: Optional[str] = None
    created_at: str
    resolved_at: Optional[str] = None
    children_count: int = 0

    class Config:
        from_attributes = True


# ===== Quotation Models =====

class QuotationBase(BaseModel):
    content: str = Field(..., min_length=1)
    source_title: Optional[str] = None
    source_author: Optional[str] = None
    source_ref: Optional[str] = None
    page_number: Optional[str] = None


class QuotationCreate(QuotationBase):
    note_id: Optional[int] = None
    tags: List[str] = []


class QuotationResponse(QuotationBase):
    id: int
    note_id: Optional[int] = None
    tags: List[str] = []
    created_at: str

    class Config:
        from_attributes = True


# ===== Link Models =====

class LinkResponse(BaseModel):
    id: int
    source_note_id: int
    target_note_id: Optional[int] = None
    target_title: str
    context: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


# ===== Decision Models =====

class DecisionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    reasoning: Optional[str] = None
    alternatives: Optional[str] = None
    outcome: Optional[str] = None


class DecisionCreate(DecisionBase):
    pass


class DecisionResponse(DecisionBase):
    id: int
    project_id: int
    created_at: str

    class Config:
        from_attributes = True


# ===== Milestone Models =====

class MilestoneBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    milestone_type: MilestoneType = MilestoneType.DISCOVERY
    significance: int = Field(default=5, ge=1, le=10)


class MilestoneCreate(MilestoneBase):
    related_note_id: Optional[int] = None


class MilestoneResponse(MilestoneBase):
    id: int
    project_id: int
    related_note_id: Optional[int] = None
    created_at: str

    class Config:
        from_attributes = True


# ===== Reminder Models =====

class ReminderBase(BaseModel):
    content: str = Field(..., min_length=1)
    due_date: str
    reminder_type: str = "note"


class ReminderCreate(ReminderBase):
    note_id: Optional[int] = None


class ReminderResponse(ReminderBase):
    id: int
    note_id: Optional[int] = None
    is_completed: bool = False
    completed_at: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


# ===== Cognitive Models =====

class CognitiveProfile(BaseModel):
    date: str
    notes_created: int = 0
    notes_edited: int = 0
    links_created: int = 0
    questions_asked: int = 0
    questions_resolved: int = 0
    active_time_minutes: int = 0
    peak_hour: Optional[int] = None
    primary_project_id: Optional[int] = None


class MomentumResponse(BaseModel):
    current_score: int = 0
    trend: MomentumTrend = MomentumTrend.STABLE
    streak_days: int = 0
    total_notes: int = 0
    total_links: int = 0
    open_questions: int = 0
    active_projects: int = 0


class WeeklyReport(BaseModel):
    week_start: str
    week_end: str
    notes_created: int = 0
    notes_edited: int = 0
    questions_asked: int = 0
    questions_resolved: int = 0
    links_created: int = 0
    most_active_day: Optional[str] = None
    primary_topics: List[str] = []


class CognitivePattern(BaseModel):
    pattern_type: str
    description: str
    frequency: int
    last_occurrence: str


# ===== Search Models =====

class SearchQuery(BaseModel):
    q: str = Field(..., min_length=1)
    search_in: List[str] = ["notes", "questions", "quotations"]
    project_id: Optional[int] = None
    tags: List[str] = []
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class SearchResult(BaseModel):
    type: str
    id: int
    title: str
    content_preview: str
    relevance_score: float
    created_at: str
    tags: List[str] = []


class SearchResponse(BaseModel):
    results: List[SearchResult]
    total_count: int
    query: str


class SearchStats(BaseModel):
    total_notes: int = 0
    total_tags: int = 0
    total_projects: int = 0
    total_links: int = 0
    total_questions: int = 0
    total_quotations: int = 0


# ===== Sync Models =====

class SyncStatus(BaseModel):
    last_local_backup: Optional[str] = None
    last_bigquery_sync: Optional[str] = None
    pending_changes: int = 0
    is_syncing: bool = False


class SyncLog(BaseModel):
    id: int
    sync_type: str
    status: str
    items_synced: int = 0
    error_message: Optional[str] = None
    started_at: str
    completed_at: Optional[str] = None


# ===== Integration Models (Iqra) =====

class IqraIntegrationStatus(BaseModel):
    connected: bool = False
    last_check: Optional[str] = None
    pending_items: int = 0


class IqraNoteInput(BaseModel):
    title: str
    content: str
    source_ref: str
    tags: List[str] = []


class IqraQuotationInput(BaseModel):
    content: str
    source_title: str
    source_ref: str
    page_number: Optional[str] = None


class IqraSearchQuery(BaseModel):
    query: str
    search_type: str = "text"


class IqraAnalysisRequest(BaseModel):
    content: str
    analysis_type: str = "general"
