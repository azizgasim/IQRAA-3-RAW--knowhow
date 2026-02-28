#!/usr/bin/env python3
"""
🚀 سكريبت تشغيل خط الأنابيب الكامل
يشغل جميع المراحل بالترتيب
منصة إقرأ - نظام التوريد
"""
import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime

# مراحل خط الأنابيب
STEPS = [
    ("📥 تحميل OpenITI", "pipeline/ingestion/openiti_downloader.py"),
    ("✂️ تقطيع النصوص", "pipeline/processing/text_chunker.py"),
    ("🏷️ التصنيف", "pipeline/classification/auto_classifier.py"),
    ("☁️ الرفع لـ BigQuery", "pipeline/upload/bigquery_uploader.py"),
]

def setup_directories():
    """إنشاء المجلدات المطلوبة"""
    dirs = [
        "data/raw/openiti",
        "data/raw/local",
        "data/raw/pdfs",
        "data/processed/chunked",
        "data/processed/classified",
        "data/staging",
        "data/archive",
        "logs",
        "config"
    ]
    for d in dirs:
        Path(d).mkdir(parents=True, exist_ok=True)
    print("📁 تم إنشاء المجلدات")

def run_step(name: str, script: str, skip_on_error: bool = False) -> bool:
    """تشغيل خطوة واحدة"""
    print(f"\n{'='*50}")
    print(f"{name}")
    print(f"{'='*50}")
    
    if not Path(script).exists():
        print(f"⚠️ الملف غير موجود: {script}")
        return skip_on_error
    
    result = subprocess.run([sys.executable, script], capture_output=False)
    
    if result.returncode != 0:
        print(f"❌ فشل في: {name}")
        return False
    
    print(f"✅ اكتمل: {name}")
    return True

def run_single_step(step_name: str):
    """تشغيل خطوة واحدة فقط"""
    step_map = {
        "download": 0,
        "chunk": 1,
        "classify": 2,
        "upload": 3
    }
    
    if step_name not in step_map:
        print(f"❌ خطوة غير معروفة: {step_name}")
        print(f"   الخطوات المتاحة: {list(step_map.keys())}")
        return
    
    idx = step_map[step_name]
    name, script = STEPS[idx]
    run_step(name, script)

def run_full_pipeline():
    """تشغيل خط الأنابيب الكامل"""
    print("🚀 بدء خط أنابيب التوريد - منصة إقرأ")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    setup_directories()
    
    successful = 0
    failed = 0
    
    for name, script in STEPS:
        if run_step(name, script, skip_on_error=True):
            successful += 1
        else:
            failed += 1
    
    print("\n" + "="*50)
    print(f"📊 النتيجة: {successful} نجح، {failed} فشل")
    print("="*50)
    
    if failed == 0:
        print("✅ اكتمل خط الأنابيب بنجاح!")
    else:
        print("⚠️ بعض الخطوات فشلت، راجع السجلات")

def show_status():
    """عرض حالة البيانات"""
    print("\n📊 حالة منظومة التوريد:")
    print("-" * 40)
    
    paths = {
        "المصادر الخام": "data/raw",
        "النصوص المقطعة": "data/processed/chunked",
        "النصوص المصنفة": "data/processed/classified",
        "جاهز للرفع": "data/staging"
    }
    
    for name, path in paths.items():
        p = Path(path)
        if p.exists():
            files = list(p.rglob("*"))
            file_count = len([f for f in files if f.is_file()])
            print(f"  {name}: {file_count} ملف")
        else:
            print(f"  {name}: (غير موجود)")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="خط أنابيب التوريد - منصة إقرأ")
    parser.add_argument("--step", "-s", choices=["download", "chunk", "classify", "upload"],
                       help="تشغيل خطوة واحدة فقط")
    parser.add_argument("--status", action="store_true", help="عرض الحالة")
    parser.add_argument("--setup", action="store_true", help="إنشاء المجلدات فقط")
    args = parser.parse_args()
    
    if args.status:
        show_status()
    elif args.setup:
        setup_directories()
    elif args.step:
        run_single_step(args.step)
    else:
        run_full_pipeline()
