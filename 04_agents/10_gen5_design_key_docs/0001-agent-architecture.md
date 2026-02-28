# ADR-0001: Agent Architecture for IQRA-12

## Status
Accepted

## Context
نظام إقرأ-12 يحتاج إلى 23 وكيل ذكي موزعين على 5 بوابات. يجب تحديد البنية المعمارية للوكلاء.

## Decision
اعتماد بنية الوكلاء التالية:

### Agent Base Class
```python
class BaseAgent:
    agent_id: str
    gate: str  # discover, link, understand, produce, manage
    category: str  # now, with_agent, playbook, policy

    async def execute(self, input: Dict) -> Dict
    async def validate_input(self, input: Dict) -> bool
    async def estimate_cost(self) -> float
```

### Gate Organization
- **اكتشف (Discover)**: 4 agents - البحث والاستكشاف
- **اربط (Link)**: 5 agents - الكيانات والعلاقات
- **افهم (Understand)**: 4 agents - التحليل والفهم
- **أنتج (Produce)**: 4 agents - الإنتاج والتصدير
- **أدِر (Manage)**: 6 agents - الإدارة والمراقبة

## Consequences
### Positive
- بنية موحدة لجميع الوكلاء
- سهولة إضافة وكلاء جدد
- تتبع التكاليف مركزي

### Negative
- تعقيد إضافي في البداية
- حاجة لتوثيق شامل

## Date
2025-12-22
