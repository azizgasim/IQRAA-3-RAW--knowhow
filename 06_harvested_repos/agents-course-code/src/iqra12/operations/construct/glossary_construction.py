"""C5: Glossary Construction - بناء المسرد"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...core.base import BaseOperation, OperationRegistry
from ...models.schemas import OperationInput, OperationOutput

@OperationRegistry.register
class C5_GlossaryConstruction(BaseOperation):
    operation_id: ClassVar[str] = "C5"
    name: ClassVar[str] = "Glossary Construction"
    name_ar: ClassVar[str] = "بناء المسرد"
    category: ClassVar[OperationCategory] = OperationCategory.CONSTRUCT
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L2

    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        terms = input_data.parameters.get("terms", [])
        glossary = [{"term": t, "definition": "", "sources": []} for t in terms]
        return OperationOutput(
            operation_id=self.operation_id,
            success=True,
            result={"glossary": glossary},
            metadata={"term_count": len(terms)}
        )
