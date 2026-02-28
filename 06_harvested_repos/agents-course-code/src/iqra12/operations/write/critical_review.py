"""W4: Critical Review - المراجعة النقدية"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...core.base import BaseOperation, OperationRegistry
from ...models.schemas import OperationInput, OperationOutput

@OperationRegistry.register
class W4_CriticalReview(BaseOperation):
    operation_id: ClassVar[str] = "W4"
    name: ClassVar[str] = "Critical Review"
    name_ar: ClassVar[str] = "المراجعة النقدية"
    category: ClassVar[OperationCategory] = OperationCategory.WRITE
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L2

    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        source = input_data.parameters.get("source", {})
        review = {"strengths": [], "weaknesses": [], "assessment": ""}
        return OperationOutput(
            operation_id=self.operation_id,
            success=True,
            result={"review": review},
            metadata={}
        )
