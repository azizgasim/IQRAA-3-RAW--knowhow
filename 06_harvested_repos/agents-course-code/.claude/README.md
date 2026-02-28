# Claude Code Configuration
## إعدادات Claude Code

---

## MCP Servers

### GitHub Server
يتيح الوصول المباشر لمستودعات GitHub.

**الإعداد:**
```bash
# Windows (PowerShell)
$env:GITHUB_TOKEN = "ghp_xxxxxxxxxxxx"

# Linux/Mac
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
```

**الاستخدام في Claude Code:**
```
اقرأ ملف README.md من مستودع Azizgasiim/agents-course-code
```

---

## الأمان

⚠️ لا تضع التوكن مباشرة في الملفات!
استخدم متغيرات البيئة أو Secret Manager.

---

*IQRA-12 Team*
