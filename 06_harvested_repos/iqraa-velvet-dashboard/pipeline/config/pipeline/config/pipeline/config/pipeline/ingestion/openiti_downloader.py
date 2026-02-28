#!/usr/bin/env python3
"""
سكريبت تحميل كوربس OpenITI
يدعم التحميل الجزئي والاستئناف
"""
import os
import subprocess
import json
from pathlib import Path
from datetime import datetime

# الإعدادات
OPENITI_REPO = "https://github.com/OpenITI/RELEASE.git"
LOCAL_PATH = Path(os.getenv("OPENITI_LOCAL_PATH", "./data/raw/openiti"))
LOG_FILE = Path("./logs/openiti_download.log")

def log(message):
    """تسجيل الرسائل"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {message}"
    print(log_entry)
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_entry + "\n")

def download_openiti(shallow=True):
    """تحميل الكوربس"""
    LOCAL_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    if LOCAL_PATH.exists() and (LOCAL_PATH / ".git").exists():
        log("📦 الكوربس موجود، جاري التحديث...")
        subprocess.run(["git", "-C", str(LOCAL_PATH), "pull"], check=True)
    else:
        log("📥 بدء تحميل OpenITI...")
        cmd = ["git", "clone"]
        if shallow:
            cmd.extend(["--depth", "1"])
        cmd.extend([OPENITI_REPO, str(LOCAL_PATH)])
        subprocess.run(cmd, check=True)
    
    log("✅ اكتمل التحميل!")
    return count_files()

def count_files():
    """عد الملفات"""
    if not LOCAL_PATH.exists():
        return {"total": 0, "texts": 0}
    
    all_files = list(LOCAL_PATH.rglob("*"))
    text_files = [f for f in all_files if f.suffix in [".txt", ".md", ".yml", ".mARkdown"]]
    
    stats = {
        "total_files": len(all_files),
        "text_files": len(text_files),
        "path": str(LOCAL_PATH)
    }
    log(f"📊 الإحصائيات: {json.dumps(stats, ensure_ascii=False)}")
    return stats

def download_specific_period(start_year, end_year):
    """تحميل فترة زمنية محددة"""
    log(f"📥 تحميل نصوص من {start_year} إلى {end_year}")
    # يمكن تخصيص هذه الدالة لاحقاً
    return download_openiti()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="تحميل OpenITI")
    parser.add_argument("--full", action="store_true", help="تحميل كامل مع التاريخ")
    parser.add_argument("--start", type=int, help="سنة البداية (هجري)")
    parser.add_argument("--end", type=int, help="سنة النهاية (هجري)")
    args = parser.parse_args()
    
    if args.start and args.end:
        download_specific_period(args.start, args.end)
    else:
        download_openiti(shallow=not args.full)
