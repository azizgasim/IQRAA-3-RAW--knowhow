"""IQRA-12 Core Schemas - النماذج الأساسية
المبدأ: لا claim بلا evidence، لا evidence بلا offsets
"""
from datetime import datetime
from typing import Any, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field

class TextSpan(BaseModel):
    """موقع النص بدقة"""
    doc_id: str
    passage_id: Optional[str] = None
    char_start: int = Field(..., ge=0)
    char_end: int = Field(..., gt=0)
    page_ref: Optional[str] = None

class Evidence(BaseModel):
    """الدليل - الوحدة الأساسية للاستشهاد"""
    evidence_id: UUID = Field(default_factory=uuid4)
    span: TextSpan
    text: str
    context_before: Optional[str] = None
    context_after: Optional[str] = None
    extraction_method: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    run_id: Optional[UUID] = None

class Claim(BaseModel):
    """الادعاء - المبدأ: لا claim بلا evidence"""
    claim_id: UUID = Field(default_factory=uuid4)
    statement: str
    evidence_bundle_id: UUID
    confidence: float = Field(..., ge=0.0, le=1.0)
    scope: str
    limitations: list[str] = Field(default_factory=list)
    status: str = "draft"

class RunContext(BaseModel):
    """سياق التشغيل - لا تشغيل بلا run_id"""
    run_id: UUID = Field(default_factory=uuid4)
    project_id: str
    user_id: str
    corpus_scope: list[str]
    cost_budget_usd: float = 1.0

class OperationInput(BaseModel):
    """مدخلات العملية"""
    operation_id: str
    context: RunContext
    parameters: dict[str, Any] = Field(default_factory=dict)

class OperationOutput(BaseModel):
    """مخرجات العملية"""
    run_id: UUID
    operation_id: str
    status: str
    artifacts: dict[str, Any] = Field(default_factory=dict)
    cost_actual_usd: float = 0.0
    confidence: float = 0.0
    limitations: list[str] = Field(default_factory=list)
    started_at: datetime
    completed_at: datetime = Field(default_factory=datetime.utcnow)
