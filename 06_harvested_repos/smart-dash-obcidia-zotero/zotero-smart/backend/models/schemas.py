"""
Zotero Smart - Pydantic Schemas
نماذج البيانات لـ Zotero Smart
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# === Enums ===

class ReferenceType(str, Enum):
    BOOK = "book"
    ARTICLE = "article"
    CHAPTER = "chapter"
    THESIS = "thesis"
    CONFERENCE = "conference"
    REPORT = "report"
    WEBPAGE = "webpage"
    MANUSCRIPT = "manuscript"
    OTHER = "other"


class ReadStatus(str, Enum):
    UNREAD = "unread"
    READING = "reading"
    READ = "read"
    SKIMMED = "skimmed"


class AnnotationType(str, Enum):
    HIGHLIGHT = "highlight"
    UNDERLINE = "underline"
    NOTE = "note"
    BOOKMARK = "bookmark"


class NoteType(str, Enum):
    GENERAL = "general"
    SUMMARY = "summary"
    CRITIQUE = "critique"
    QUOTE = "quote"
    QUESTION = "question"


class RelationType(str, Enum):
    RELATED = "related"
    CITES = "cites"
    CITED_BY = "cited_by"
    RESPONDS_TO = "responds_to"
    BUILDS_ON = "builds_on"
    CONTRADICTS = "contradicts"


# === Reference Schemas ===

class ReferenceBase(BaseModel):
    title: str
    title_ar: Optional[str] = None
    authors: Optional[str] = None
    authors_ar: Optional[str] = None
    year: Optional[int] = None
    hijri_year: Optional[str] = None
    type: ReferenceType = ReferenceType.BOOK
    publisher: Optional[str] = None
    journal: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    doi: Optional[str] = None
    isbn: Optional[str] = None
    url: Optional[str] = None
    abstract: Optional[str] = None
    abstract_ar: Optional[str] = None
    language: str = "ar"


class ReferenceCreate(ReferenceBase):
    tags: Optional[List[str]] = []
    collection_ids: Optional[List[int]] = []


class ReferenceUpdate(BaseModel):
    title: Optional[str] = None
    title_ar: Optional[str] = None
    authors: Optional[str] = None
    authors_ar: Optional[str] = None
    year: Optional[int] = None
    hijri_year: Optional[str] = None
    type: Optional[ReferenceType] = None
    publisher: Optional[str] = None
    journal: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    doi: Optional[str] = None
    isbn: Optional[str] = None
    url: Optional[str] = None
    abstract: Optional[str] = None
    abstract_ar: Optional[str] = None
    language: Optional[str] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None
    read_status: Optional[ReadStatus] = None
    rating: Optional[int] = None
    tags: Optional[List[str]] = None
    collection_ids: Optional[List[int]] = None


class ReferenceResponse(ReferenceBase):
    id: int
    citation_key: Optional[str] = None
    bibtex: Optional[str] = None
    zotero_key: Optional[str] = None
    pdf_path: Optional[str] = None
    cover_image: Optional[str] = None
    is_favorite: bool = False
    is_archived: bool = False
    read_status: ReadStatus = ReadStatus.UNREAD
    rating: int = 0
    tags: List[str] = []
    collections: List[dict] = []
    annotations_count: int = 0
    notes_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# === Collection Schemas ===

class CollectionBase(BaseModel):
    name: str
    name_ar: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None
    color: str = "#10b981"
    icon: str = "folder"


class CollectionCreate(CollectionBase):
    pass


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    name_ar: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None


class CollectionResponse(CollectionBase):
    id: int
    sort_order: int = 0
    references_count: int = 0
    children: List["CollectionResponse"] = []
    created_at: datetime

    class Config:
        from_attributes = True


# === Tag Schemas ===

class TagBase(BaseModel):
    name: str
    color: str = "#6b7280"


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: int
    references_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# === Annotation Schemas ===

class AnnotationBase(BaseModel):
    type: AnnotationType = AnnotationType.HIGHLIGHT
    content: Optional[str] = None
    comment: Optional[str] = None
    page_number: Optional[int] = None
    position_data: Optional[str] = None
    color: str = "#fef08a"


class AnnotationCreate(AnnotationBase):
    reference_id: int


class AnnotationUpdate(BaseModel):
    content: Optional[str] = None
    comment: Optional[str] = None
    color: Optional[str] = None


class AnnotationResponse(AnnotationBase):
    id: int
    reference_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# === Note Schemas ===

class NoteBase(BaseModel):
    title: Optional[str] = None
    content: str
    note_type: NoteType = NoteType.GENERAL


class NoteCreate(NoteBase):
    reference_id: int


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    note_type: Optional[NoteType] = None


class NoteResponse(NoteBase):
    id: int
    reference_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# === Author Schemas ===

class AuthorBase(BaseModel):
    name: str
    name_ar: Optional[str] = None
    orcid: Optional[str] = None
    affiliation: Optional[str] = None
    bio: Optional[str] = None


class AuthorCreate(AuthorBase):
    pass


class AuthorResponse(AuthorBase):
    id: int
    references_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# === Related Reference Schemas ===

class RelatedReferenceCreate(BaseModel):
    source_id: int
    target_id: int
    relation_type: RelationType = RelationType.RELATED
    note: Optional[str] = None


class RelatedReferenceResponse(BaseModel):
    id: int
    source_id: int
    target_id: int
    target_title: str
    relation_type: RelationType
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# === Reading Session Schemas ===

class ReadingSessionCreate(BaseModel):
    reference_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    pages_read: int = 0
    notes: Optional[str] = None


class ReadingSessionResponse(BaseModel):
    id: int
    reference_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    pages_read: int = 0
    notes: Optional[str] = None
    duration_minutes: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# === Citation Schemas ===

class CitationStyle(str, Enum):
    APA = "apa"
    MLA = "mla"
    CHICAGO = "chicago"
    HARVARD = "harvard"
    IEEE = "ieee"
    VANCOUVER = "vancouver"
    ARABIC_CHICAGO = "arabic-chicago"


class CitationRequest(BaseModel):
    reference_id: int
    style: CitationStyle


class CitationResponse(BaseModel):
    id: int
    reference_id: int
    style: str
    formatted_citation: str
    created_at: datetime

    class Config:
        from_attributes = True


# === Search Schemas ===

class SearchRequest(BaseModel):
    query: str
    type: Optional[ReferenceType] = None
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    language: Optional[str] = None
    tags: Optional[List[str]] = None
    collection_id: Optional[int] = None
    read_status: Optional[ReadStatus] = None
    limit: int = 50
    offset: int = 0


class SearchResult(BaseModel):
    id: int
    title: str
    title_ar: Optional[str] = None
    authors: Optional[str] = None
    year: Optional[int] = None
    type: ReferenceType
    relevance_score: float = 0.0

    class Config:
        from_attributes = True


# === Import/Export Schemas ===

class ImportRequest(BaseModel):
    source: str  # bibtex, ris, zotero, mendeley
    data: str


class ImportResult(BaseModel):
    success: bool
    imported_count: int
    failed_count: int
    errors: List[str] = []


class ExportRequest(BaseModel):
    reference_ids: List[int]
    format: str  # bibtex, ris, json


# === Statistics Schemas ===

class LibraryStats(BaseModel):
    total_references: int
    by_type: dict
    by_year: dict
    by_language: dict
    by_read_status: dict
    total_annotations: int
    total_notes: int
    total_reading_hours: float
    recent_additions: int
    favorites_count: int


class ReadingStats(BaseModel):
    total_sessions: int
    total_hours: float
    pages_read: int
    average_session_minutes: float
    by_month: List[dict]


# === Integration Schemas (Iqra Platform) ===

class SendToNotebookRequest(BaseModel):
    reference_id: int
    include_annotations: bool = True
    include_notes: bool = True


class SendToGraphRequest(BaseModel):
    reference_ids: List[int]
    include_relations: bool = True


class ReceiveFromIqraRequest(BaseModel):
    source: str  # reader, agent
    data: dict


# Fix forward reference
CollectionResponse.model_rebuild()
