"""A3: Comparative Analysis - التحليل المقارن"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...core.base import BaseOperation, OperationRegistry
from ...models.schemas import OperationInput, OperationOutput

@OperationRegistry.register
class A3_ComparativeAnalysis(BaseOperation):
    operation_id: ClassVar[str] = "A3"
    name: ClassVar[str] = "Comparative Analysis"
    name_ar: ClassVar[str] = "التحليل المقارن"
    category: ClassVar[OperationCategory] = OperationCategory.ANALYZE
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L1

    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        sources = input_data.parameters.get("source_ids", [])
        comparison = {"similarities": [], "differences": [], "unique_aspects": {}}
        return OperationOutput(
            operation_id=self.operation_id,
            success=True,
            result={"sources": sources, "comparison": comparison},
            metadata={"source_count": len(sources)}
        )
