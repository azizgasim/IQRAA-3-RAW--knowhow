"""IQRA-12 Base Operation - الفئة الأساسية للعمليات الـ 44
المبدأ: الوكيل ليس كياناً ثابتاً، بل تركيبة ديناميكية
"""
from abc import ABC, abstractmethod
from datetime import datetime
from typing import ClassVar
import structlog

from ..models.enums import AutonomyLevel, OperationCategory, OperationStatus
from ..models.schemas import OperationInput, OperationOutput, RunContext

logger = structlog.get_logger()

class BaseOperation(ABC):
    """الفئة الأساسية - كل عملية ترث منها"""
    
    operation_id: ClassVar[str]
    name: ClassVar[str]
    name_ar: ClassVar[str]
    category: ClassVar[OperationCategory]
    autonomy_level: ClassVar[AutonomyLevel]
    cost_estimate_usd: ClassVar[float] = 0.01

    async def execute(self, input_data: OperationInput) -> OperationOutput:
        """نقطة الدخول الرئيسية"""
        started_at = datetime.utcnow()
        context = input_data.context
        
        try:
            self._validate_context(context)
            result = await self._execute(input_data)
            return OperationOutput(
                run_id=context.run_id,
                operation_id=self.operation_id,
                status=OperationStatus.COMPLETED,
                artifacts=result.artifacts,
                cost_actual_usd=result.cost_actual_usd,
                confidence=result.confidence,
                started_at=started_at,
            )
        except Exception as e:
            return OperationOutput(
                run_id=context.run_id,
                operation_id=self.operation_id,
                status=OperationStatus.FAILED,
                started_at=started_at,
            )

    @abstractmethod
    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        """التنفيذ الفعلي - يجب تنفيذها"""
        pass

    def _validate_context(self, context: RunContext) -> None:
        """التحقق من سياق التشغيل"""
        if not context.run_id:
            raise ValueError("run_id is required")

class OperationRegistry:
    """سجل العمليات المركزي"""
    _operations: dict[str, type[BaseOperation]] = {}

    @classmethod
    def register(cls, op_class: type[BaseOperation]):
        cls._operations[op_class.operation_id] = op_class
        return op_class

    @classmethod
    def get(cls, operation_id: str) -> type[BaseOperation]:
        return cls._operations[operation_id]
