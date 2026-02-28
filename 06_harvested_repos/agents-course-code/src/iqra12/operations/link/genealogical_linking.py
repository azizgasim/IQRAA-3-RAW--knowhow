"""L5: Genealogical Linking - الربط السندي"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...core.base import BaseOperation, OperationRegistry
from ...models.schemas import OperationInput, OperationOutput

@OperationRegistry.register
class L5_GenealogicalLinking(BaseOperation):
    operation_id: ClassVar[str] = "L5"
    name: ClassVar[str] = "Genealogical Linking"
    name_ar: ClassVar[str] = "الربط السندي"
    category: ClassVar[OperationCategory] = OperationCategory.LINK
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L1

    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        chain = input_data.parameters.get("narration_chain", [])
        links = []
        for i in range(len(chain) - 1):
            links.append({
                "from_narrator": chain[i],
                "to_narrator": chain[i + 1],
                "relationship": "transmits_from",
                "verified": False
            })
        return OperationOutput(
            operation_id=self.operation_id,
            success=True,
            result={"genealogical_links": links},
            metadata={"chain_length": len(chain)}
        )
