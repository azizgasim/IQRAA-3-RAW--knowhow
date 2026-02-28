"""
Simple Cache - In-Memory Caching
بديل بسيط لـ Redis (لا يحتاج تثبيت)

المسار: /home/user/iqraa-12-platform/dashboard/backend/simple_cache.py
"""

from typing import Any, Optional
from datetime import datetime, timedelta
import hashlib
import json


class SimpleCache:
    """
    Cache بسيط في الذاكرة
    
    الفوائد:
    • لا يحتاج Redis
    • سريع جداً
    • يعمل فوراً
    
    القيود:
    • يُمسح عند إعادة تشغيل Backend
    • محدود بذاكرة السيرفر
    """
    
    def __init__(self, ttl_minutes: int = 60):
        self.cache = {}
        self.ttl = timedelta(minutes=ttl_minutes)
        print(f"✅ Simple Cache initialized (TTL: {ttl_minutes} دقيقة)")
    
    def _make_key(self, query: str, filters: dict) -> str:
        """إنشاء مفتاح فريد"""
        data = json.dumps({"q": query, "f": filters}, sort_keys=True, ensure_ascii=False)
        return hashlib.md5(data.encode()).hexdigest()
    
    def get(self, query: str, filters: dict = None) -> Optional[Any]:
        """الحصول من Cache"""
        
        key = self._make_key(query, filters or {})
        
        if key in self.cache:
            entry = self.cache[key]
            
            # تحقق من الصلاحية
            if datetime.now() - entry["timestamp"] < self.ttl:
                print(f"   ✅ Cache Hit: {query[:30]}...")
                return entry["data"]
            else:
                # منتهي الصلاحية
                del self.cache[key]
        
        return None
    
    def set(self, query: str, data: Any, filters: dict = None):
        """الحفظ في Cache"""
        
        key = self._make_key(query, filters or {})
        
        self.cache[key] = {
            "data": data,
            "timestamp": datetime.now()
        }
        
        print(f"   💾 Cache Set: {query[:30]}...")
    
    def clear_expired(self):
        """حذف المنتهية"""
        now = datetime.now()
        expired = [k for k, v in self.cache.items() if now - v["timestamp"] >= self.ttl]
        
        for k in expired:
            del self.cache[k]
        
        if expired:
            print(f"   🧹 تم حذف {len(expired)} إدخالات منتهية")
    
    def stats(self) -> dict:
        """إحصائيات"""
        return {
            "total_entries": len(self.cache),
            "ttl_minutes": self.ttl.total_seconds() / 60
        }

