"""S2: Report Synthesis - تركيب التقرير"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...core.base import BaseOperation, OperationRegistry
from ...models.schemas import OperationInput, OperationOutput

@OperationRegistry.register
class S2_ReportSynthesis(BaseOperation):
    operation_id: ClassVar[str] = "S2"
    name: ClassVar[str] = "Report Synthesis"
    name_ar: ClassVar[str] = "تركيب التقرير"
    category: ClassVar[OperationCategory] = OperationCategory.SYNTHESIZE
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L2

    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        sections = input_data.parameters.get("sections", [])
        report = {"title": "", "sections": sections, "summary": ""}
        return OperationOutput(
            operation_id=self.operation_id,
            success=True,
            result={"report": report},
            metadata={"section_count": len(sections)}
        )
