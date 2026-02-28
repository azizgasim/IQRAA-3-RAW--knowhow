#!/usr/bin/env python3
"""
🗑️ IQRAA Project - Repository Cleanup Automation Script
========================================================

هذا السكريبت يساعدك في:
1. حذف الملفات المكررة من المستودعات
2. أرشفة المستودعات المكررة
3. حذف المستودعات الميتة (يحتاج تدخل يدوي)

الاستخدام:
-----------
# 1. تثبيت المتطلبات
pip install PyGithub

# 2. تعيين GitHub Token
export GITHUB_TOKEN="your_github_personal_access_token"

# 3. اختبار (Dry Run) - لا يحذف شيء
python cleanup_script.py --action test

# 4. حذف الملفات المكررة
python cleanup_script.py --action delete-duplicates --repo iqraa-velvet-dashboard

# 5. أرشفة مستودع
python cleanup_script.py --action archive --repo iqraa-velvet-dashboard

# 6. تقرير شامل
python cleanup_script.py --action report

المتطلبات:
-----------
- Python 3.7+
- PyGithub
- GitHub Personal Access Token مع صلاحيات: repo, delete_repo
"""

import os
import sys
import json
from typing import List, Dict
from datetime import datetime

try:
    from github import Github, GithubException
except ImportError:
    print("❌ خطأ: PyGithub غير مثبت")
    print("   قم بتثبيته: pip install PyGithub")
    sys.exit(1)

# ===== الإعدادات =====
OWNER = "Azizgasiim"

# المستودعات والملفات المكررة
DUPLICATES = {
    "iqraa-velvet-dashboard": {
        "files": [
            "index.css",
            "iqraa_ALL_103_tables.sql",
            "الكود العظيم للجداول بق كويري",
            "كود استقبال السؤال.docx"
        ],
        "reason": "محتوى مكرر من iqraa12-2040",
        "action": "archive"
    },
    "iqraa-12-platform": {
        "files": [
            "backend",
            "pipeline",
            "src"
        ],
        "reason": "محتوى مكرر من IQRAA-12",
        "action": "archive"
    }
}

# المستودعات الميتة (للحذف)
DEAD_REPOS = [
    "iqraa-knowledge-miner",
    "iqraa-agents-jadal"
]

# ===== الدوال المساعدة =====

def get_github_client():
    """الحصول على GitHub client"""
    token = os.getenv('GITHUB_TOKEN')
    if not token:
        print("❌ خطأ: GITHUB_TOKEN غير موجود في environment variables")
        print("\n💡 لإنشاء Token:")
        print("   1. اذهب إلى https://github.com/settings/tokens/new")
        print("   2. اختر: repo, delete_repo")
        print("   3. انسخ التوكن وقم بتصديره:")
        print("      export GITHUB_TOKEN='your_token_here'")
        sys.exit(1)
    return Github(token)

def print_header(text):
    """طباعة عنوان منسق"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def delete_file_from_repo(repo, file_path, dry_run=True):
    """حذف ملف من المستودع"""
    try:
        # محاولة الحصول على الملف
        try:
            contents = repo.get_contents(file_path)
            if isinstance(contents, list):
                # إذا كان مجلد، احذف كل الملفات فيه
                for content in contents:
                    delete_file_from_repo(repo, content.path, dry_run)
                return True
        except GithubException as e:
            if e.status == 404:
                print(f"   ⚠️  الملف غير موجود: {file_path}")
                return False
            raise
        
        if dry_run:
            print(f"   🔍 [DRY RUN] سيتم حذف: {file_path} ({contents.size} bytes)")
        else:
            repo.delete_file(
                contents.path,
                f"chore: remove duplicate file - {file_path}",
                contents.sha,
                branch="main"
            )
            print(f"   ✅ تم حذف: {file_path}")
        
        return True
    
    except Exception as e:
        print(f"   ❌ خطأ في حذف {file_path}: {str(e)}")
        return False

def delete_duplicates(repo_name, dry_run=True):
    """حذف الملفات المكررة من مستودع"""
    print_header(f"حذف الملفات المكررة من: {repo_name}")
    
    if repo_name not in DUPLICATES:
        print(f"❌ المستودع {repo_name} غير موجود في قائمة التكرارات")
        return False
    
    g = get_github_client()
    
    try:
        repo = g.get_repo(f"{OWNER}/{repo_name}")
        files = DUPLICATES[repo_name]["files"]
        reason = DUPLICATES[repo_name]["reason"]
        
        print(f"📦 المستودع: {repo.full_name}")
        print(f"📝 السبب: {reason}")
        print(f"📊 عدد الملفات: {len(files)}\n")
        
        success_count = 0
        for file_path in files:
            if delete_file_from_repo(repo, file_path, dry_run):
                success_count += 1
        
        print(f"\n{'[DRY RUN] ' if dry_run else ''}النتيجة: {success_count}/{len(files)} ملف")
        
        if not dry_run and success_count > 0:
            print(f"\n🔗 راجع التغييرات: {repo.html_url}/commits/main")
        
        return True
        
    except GithubException as e:
        print(f"❌ خطأ في الوصول للمستودع: {e}")
        return False

def archive_repository(repo_name, dry_run=True):
    """أرشفة مستودع"""
    print_header(f"أرشفة المستودع: {repo_name}")
    
    g = get_github_client()
    
    try:
        repo = g.get_repo(f"{OWNER}/{repo_name}")
        
        if repo.archived:
            print(f"⚠️  المستودع مؤرشف مسبقاً")
            return True
        
        print(f"📦 المستودع: {repo.full_name}")
        print(f"📊 الحجم: {repo.size} KB")
        print(f"🕒 آخر تحديث: {repo.updated_at}")
        
        if dry_run:
            print(f"\n🔍 [DRY RUN] سيتم أرشفة المستودع")
        else:
            # أرشفة المستودع
            repo.edit(archived=True)
            print(f"\n✅ تم أرشفة المستودع بنجاح!")
            print(f"🔗 رابط المستودع: {repo.html_url}")
        
        return True
        
    except GithubException as e:
        print(f"❌ خطأ: {e}")
        return False

def generate_report():
    """إنشاء تقرير شامل"""
    print_header("📊 تقرير شامل - IQRAA Project Cleanup")
    
    g = get_github_client()
    
    print(f"👤 المستخدم: {OWNER}")
    print(f"📅 التاريخ: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # المستودعات المكررة
    print("🔄 المستودعات المكررة:")
    print("-" * 60)
    total_size = 0
    for repo_name, config in DUPLICATES.items():
        try:
            repo = g.get_repo(f"{OWNER}/{repo_name}")
            status = "🟢 نشط" if not repo.archived else "🔴 مؤرشف"
            print(f"\n  {status} {repo_name}")
            print(f"     الحجم: {repo.size} KB")
            print(f"     الملفات المكررة: {len(config['files'])}")
            print(f"     السبب: {config['reason']}")
            total_size += repo.size
        except GithubException:
            print(f"\n  ❌ {repo_name} (غير متاح)")
    
    print(f"\n  📊 إجمالي الحجم: {total_size} KB")
    
    # المستودعات الميتة
    print("\n\n🗑️  المستودعات الميتة:")
    print("-" * 60)
    for repo_name in DEAD_REPOS:
        try:
            repo = g.get_repo(f"{OWNER}/{repo_name}")
            print(f"\n  🟠 {repo_name}")
            print(f"     الحجم: {repo.size} KB")
        except GithubException:
            print(f"\n  ❌ {repo_name} (غير موجود أو محذوف)")
    
    # توصيات
    print("\n\n💡 التوصيات:")
    print("-" * 60)
    print("  1. حذف الملفات المكررة من المستودعات")
    print("  2. أرشفة المستودعات المكررة")
    print("  3. حذف المستودعات الميتة يدوياً من GitHub Settings")
    
    print("\n📖 للمزيد من التفاصيل:")
    print(f"   https://github.com/{OWNER}/iqraa-docs/blob/main/DUPLICATION_REPORT.md")

def list_dead_repos():
    """عرض المستودعات الميتة وكيفية حذفها"""
    print_header("🗑️  المستودعات الميتة - دليل الحذف")
    
    g = get_github_client()
    
    print("⚠️  ملاحظة: حذف المستودعات يتطلب تدخل يدوي من GitHub Web Interface\n")
    
    for i, repo_name in enumerate(DEAD_REPOS, 1):
        print(f"{i}. {repo_name}")
        try:
            repo = g.get_repo(f"{OWNER}/{repo_name}")
            print(f"   📊 الحالة: موجود")
            print(f"   📏 الحجم: {repo.size} KB")
            print(f"   🔗 حذف: https://github.com/{OWNER}/{repo_name}/settings")
        except GithubException:
            print(f"   ✅ محذوف مسبقاً أو غير موجود")
        print()
    
    print("\n📋 خطوات الحذف:")
    print("   1. افتح رابط Settings أعلاه")
    print("   2. Scroll للأسفل → 'Delete this repository'")
    print("   3. اكتب اسم المستودع الكامل للتأكيد")
    print("   4. اضغط 'I understand the consequences, delete this repository'\n")

# ===== البرنامج الرئيسي =====

def main():
    """البرنامج الرئيسي"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="IQRAA Project Cleanup Automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
أمثلة الاستخدام:
-----------------
  # اختبار (لا يحذف شيء)
  python cleanup_script.py --action test
  
  # تقرير شامل
  python cleanup_script.py --action report
  
  # حذف الملفات المكررة (اختبار)
  python cleanup_script.py --action delete-duplicates --repo iqraa-velvet-dashboard --dry-run
  
  # حذف الملفات المكررة (فعلي)
  python cleanup_script.py --action delete-duplicates --repo iqraa-velvet-dashboard
  
  # أرشفة مستودع
  python cleanup_script.py --action archive --repo iqraa-velvet-dashboard
  
  # قائمة المستودعات الميتة
  python cleanup_script.py --action list-dead
        """
    )
    
    parser.add_argument(
        '--action',
        choices=['test', 'report', 'delete-duplicates', 'archive', 'list-dead'],
        required=True,
        help='الإجراء المطلوب'
    )
    
    parser.add_argument(
        '--repo',
        help='اسم المستودع (مطلوب مع delete-duplicates و archive)'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='اختبار فقط (لا يحذف شيء)'
    )
    
    args = parser.parse_args()
    
    # التحقق من التوكن
    if not os.getenv('GITHUB_TOKEN'):
        print("❌ خطأ: GITHUB_TOKEN غير موجود")
        print("\n💡 قم بتصديره أولاً:")
        print("   export GITHUB_TOKEN='your_github_token'\n")
        sys.exit(1)
    
    # تنفيذ الإجراء
    if args.action == 'test':
        print_header("🧪 اختبار الاتصال")
        g = get_github_client()
        user = g.get_user(OWNER)
        print(f"✅ الاتصال ناجح!")
        print(f"👤 المستخدم: {user.login}")
        print(f"📊 المستودعات: {user.public_repos}")
        
    elif args.action == 'report':
        generate_report()
        
    elif args.action == 'delete-duplicates':
        if not args.repo:
            print("❌ خطأ: --repo مطلوب مع delete-duplicates")
            sys.exit(1)
        delete_duplicates(args.repo, args.dry_run)
        
    elif args.action == 'archive':
        if not args.repo:
            print("❌ خطأ: --repo مطلوب مع archive")
            sys.exit(1)
        archive_repository(args.repo, args.dry_run)
        
    elif args.action == 'list-dead':
        list_dead_repos()

if __name__ == "__main__":
    main()