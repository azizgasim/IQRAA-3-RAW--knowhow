"""L4: Intertextual Linking - الربط البيني"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...core.base import BaseOperation, OperationRegistry
from ...models.schemas import OperationInput, OperationOutput

@OperationRegistry.register
class L4_IntertextualLinking(BaseOperation):
    operation_id: ClassVar[str] = "L4"
    name: ClassVar[str] = "Intertextual Linking"
    name_ar: ClassVar[str] = "الربط البيني"
    category: ClassVar[OperationCategory] = OperationCategory.LINK
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L1

    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        source_id = input_data.parameters.get("source_document_id")
        target_ids = input_data.parameters.get("target_document_ids", [])
        links = []
        for target in target_ids:
            links.append({
                "source": source_id,
                "target": target,
                "link_type": "reference",
                "strength": 0.0
            })
        return OperationOutput(
            operation_id=self.operation_id,
            success=True,
            result={"intertextual_links": links},
            metadata={"source": source_id}
        )
