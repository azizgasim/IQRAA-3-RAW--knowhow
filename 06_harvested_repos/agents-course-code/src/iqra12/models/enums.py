"""IQRA-12 Enumerations - التعدادات الأساسية"""
from enum import Enum

class AutonomyLevel(str, Enum):
    L0 = "L0"  # قراءة فقط
    L1 = "L1"  # اقتراح
    L2 = "L2"  # تنفيذ مراقب
    L3 = "L3"  # تنفيذ مشروط
    L4 = "L4"  # طيار محدود

class OperationCategory(str, Enum):
    EXTRACT = "E"
    LINK = "L"
    TRACE = "T"
    ANALYZE = "A"
    CONSTRUCT = "C"
    SYNTHESIZE = "S"
    WRITE = "W"
    VERIFY = "V"

class RiskTier(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    
class OperationStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
