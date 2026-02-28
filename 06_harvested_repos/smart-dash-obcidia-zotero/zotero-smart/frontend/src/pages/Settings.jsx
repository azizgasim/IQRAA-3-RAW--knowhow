/**
 * Settings - الإعدادات
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings as SettingsIcon, Moon, Sun, Globe, Bell,
  Database, Trash2, Download, Upload, RefreshCw,
  CheckCircle, AlertTriangle, ExternalLink, Palette
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';

export default function Settings() {
  const queryClient = useQueryClient();
  const { darkMode, toggleDarkMode, setPreference, preferences } = useStore();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);

  const clearDataMutation = useMutation({
    mutationFn: () => api.clearAllData(),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowConfirmClear(false);
    },
  });

  const citationStyles = [
    { id: 'apa', name: 'APA', desc: 'American Psychological Association' },
    { id: 'mla', name: 'MLA', desc: 'Modern Language Association' },
    { id: 'chicago', name: 'Chicago', desc: 'Chicago Manual of Style' },
    { id: 'harvard', name: 'Harvard', desc: 'Harvard Referencing' },
    { id: 'ieee', name: 'IEEE', desc: 'Institute of Electrical and Electronics Engineers' },
    { id: 'vancouver', name: 'Vancouver', desc: 'Vancouver Style' },
    { id: 'arabic-chicago', name: 'شيكاغو (عربي)', desc: 'نمط شيكاغو للمصادر العربية' },
  ];

  const languages = [
    { id: 'ar', name: 'العربية', native: true },
    { id: 'en', name: 'English', native: false },
  ];

  const handleExportAll = async () => {
    setExportProgress('جاري التصدير...');
    try {
      const blob = await api.exportReferences('json');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zotero-smart-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportProgress('تم التصدير بنجاح!');
      setTimeout(() => setExportProgress(null), 3000);
    } catch (error) {
      setExportProgress('فشل التصدير');
      setTimeout(() => setExportProgress(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الإعدادات</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          تخصيص تجربتك في زوتيرو الذكي
        </p>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <h2 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-gray-400" />
          المظهر
        </h2>

        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-5 w-5 text-gray-400" /> : <Sun className="h-5 w-5 text-gray-400" />}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">الوضع الليلي</p>
                <p className="text-sm text-gray-500">تفعيل المظهر الداكن</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                darkMode ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? 'right-1' : 'right-8'
                }`}
              />
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">اللغة</p>
                <p className="text-sm text-gray-500">لغة واجهة المستخدم</p>
              </div>
            </div>
            <select
              value={preferences?.language || 'ar'}
              onChange={(e) => setPreference('language', e.target.value)}
              className="input w-40"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Citation Settings */}
      <div className="card p-6">
        <h2 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-gray-400" />
          إعدادات الاقتباس
        </h2>

        <div className="space-y-4">
          {/* Default Citation Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              نمط الاقتباس الافتراضي
            </label>
            <select
              value={preferences?.defaultCitationStyle || 'apa'}
              onChange={(e) => setPreference('defaultCitationStyle', e.target.value)}
              className="input w-full"
            >
              {citationStyles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name} - {style.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Include DOI */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">تضمين DOI</p>
              <p className="text-sm text-gray-500">إضافة رابط DOI في الاقتباسات</p>
            </div>
            <button
              onClick={() => setPreference('includeDOI', !preferences?.includeDOI)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                preferences?.includeDOI ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences?.includeDOI ? 'right-1' : 'right-8'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <h2 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-400" />
          الإشعارات
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">إشعارات الاستيراد</p>
              <p className="text-sm text-gray-500">إشعار عند اكتمال استيراد المراجع</p>
            </div>
            <button
              onClick={() => setPreference('importNotifications', !preferences?.importNotifications)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                preferences?.importNotifications !== false ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences?.importNotifications !== false ? 'right-1' : 'right-8'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card p-6">
        <h2 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-gray-400" />
          إدارة البيانات
        </h2>

        <div className="space-y-4">
          {/* Export */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">تصدير جميع البيانات</p>
                <p className="text-sm text-gray-500">تنزيل نسخة احتياطية كاملة</p>
              </div>
            </div>
            <button
              onClick={handleExportAll}
              disabled={exportProgress === 'جاري التصدير...'}
              className="btn btn-secondary"
            >
              {exportProgress ? (
                <>
                  {exportProgress === 'جاري التصدير...' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : exportProgress === 'تم التصدير بنجاح!' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  {exportProgress}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  تصدير
                </>
              )}
            </button>
          </div>

          {/* Import */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">استيراد المراجع</p>
                <p className="text-sm text-gray-500">استيراد من BibTeX أو RIS أو JSON</p>
              </div>
            </div>
            <a href="/import" className="btn btn-secondary">
              <Upload className="h-4 w-4" />
              استيراد
            </a>
          </div>

          {/* Clear Data */}
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">مسح جميع البيانات</p>
                <p className="text-sm text-red-600 dark:text-red-400">حذف جميع المراجع والمجموعات والوسوم</p>
              </div>
            </div>
            <button
              onClick={() => setShowConfirmClear(true)}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4" />
              مسح
            </button>
          </div>
        </div>
      </div>

      {/* Integration */}
      <div className="card p-6">
        <h2 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-gray-400" />
          التكامل مع منصة إقرأ
        </h2>

        <div className="space-y-4">
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              زوتيرو الذكي متكامل مع أدوات منصة إقرأ الأخرى:
            </p>
            <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                المفكرة الذكية - إرسال المراجع إلى ملاحظاتك
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                UltraGraph - عرض المراجع في خريطة المعرفة
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                القارئ الذكي - استقبال المراجع من مواد القراءة
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                الوكيل الذكي - استقبال المراجع المقترحة
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card p-6">
        <h2 className="font-medium text-gray-900 dark:text-white mb-4">حول التطبيق</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>زوتيرو الذكي</strong> - طبقة إدارة المراجع لمنصة إقرأ</p>
          <p>الإصدار: 1.0.0</p>
          <p>جزء من منصة إقرأ للبحث في التراث الإسلامي</p>
        </div>
      </div>

      {/* Confirm Clear Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  تأكيد حذف البيانات
                </h3>
                <p className="text-sm text-gray-500">هذا الإجراء لا يمكن التراجع عنه</p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              سيتم حذف جميع المراجع والمجموعات والوسوم والتعليقات نهائياً.
              ننصح بتصدير نسخة احتياطية قبل المتابعة.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="btn btn-secondary flex-1"
              >
                إلغاء
              </button>
              <button
                onClick={() => clearDataMutation.mutate()}
                disabled={clearDataMutation.isLoading}
                className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                {clearDataMutation.isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                نعم، احذف الكل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
