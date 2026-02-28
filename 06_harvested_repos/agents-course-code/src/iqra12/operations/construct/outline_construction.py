"""C4: Outline Construction - بناء المخطط"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...core.base import BaseOperation, OperationRegistry
from ...models.schemas import OperationInput, OperationOutput

@OperationRegistry.register
class C4_OutlineConstruction(BaseOperation):
    operation_id: ClassVar[str] = "C4"
    name: ClassVar[str] = "Outline Construction"
    name_ar: ClassVar[str] = "بناء المخطط"
    category: ClassVar[OperationCategory] = OperationCategory.CONSTRUCT
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L2

    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        topic = input_data.parameters.get("topic", "")
        sections = input_data.parameters.get("sections", [])
        outline = {"topic": topic, "sections": sections, "hierarchy": []}
        return OperationOutput(
            operation_id=self.operation_id,
            success=True,
            result={"outline": outline},
            metadata={"section_count": len(sections)}
        )
