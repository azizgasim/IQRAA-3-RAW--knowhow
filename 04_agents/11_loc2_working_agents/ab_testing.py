"""
A/B Testing Framework
اختبار نماذج وإعدادات مختلفة

المسار: /home/user/iqraa-12-platform/dashboard/backend/ab_testing.py
"""

import random
from typing import Dict, Any
from enum import Enum


class Variant(Enum):
    """المتغيرات"""
    CONTROL = "control"      # النظام الحالي
    VARIANT_A = "variant_a"  # تجربة A
    VARIANT_B = "variant_b"  # تجربة B


class ABTester:
    """
    نظام A/B Testing
    
    الاستخدام:
    • 80% من الطلبات: Control (النظام الحالي)
    • 10% من الطلبات: Variant A (تجربة)
    • 10% من الطلبات: Variant B (تجربة)
    """
    
    def __init__(self):
        self.distribution = {
            Variant.CONTROL: 0.8,    # 80%
            Variant.VARIANT_A: 0.1,  # 10%
            Variant.VARIANT_B: 0.1   # 10%
        }
        print("✅ A/B Tester initialized")
    
    def assign_variant(self, user_id: str = None) -> Variant:
        """تعيين متغير للمستخدم"""
        
        # إذا كان هناك user_id، استخدم hash للاتساق
        if user_id:
            hash_val = hash(user_id) % 100
            
            if hash_val < 80:
                return Variant.CONTROL
            elif hash_val < 90:
                return Variant.VARIANT_A
            else:
                return Variant.VARIANT_B
        
        # عشوائي
        rand = random.random()
        
        if rand < 0.8:
            return Variant.CONTROL
        elif rand < 0.9:
            return Variant.VARIANT_A
        else:
            return Variant.VARIANT_B
    
    def get_config(self, variant: Variant) -> Dict[str, Any]:
        """الحصول على إعدادات المتغير"""
        
        configs = {
            Variant.CONTROL: {
                "name": "النظام الحالي",
                "gps_confidence_threshold": 0.8,
                "verification_enabled": True,
                "cache_enabled": True
            },
            Variant.VARIANT_A: {
                "name": "تجربة A: ثقة أعلى",
                "gps_confidence_threshold": 0.9,  # أكثر صرامة
                "verification_enabled": True,
                "cache_enabled": True
            },
            Variant.VARIANT_B: {
                "name": "تجربة B: بدون تحقق",
                "gps_confidence_threshold": 0.8,
                "verification_enabled": False,  # أسرع
                "cache_enabled": True
            }
        }
        
        return configs.get(variant, configs[Variant.CONTROL])

