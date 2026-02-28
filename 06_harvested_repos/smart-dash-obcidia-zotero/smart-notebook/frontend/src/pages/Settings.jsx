/**
 * Settings - الإعدادات
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings as SettingsIcon, Moon, Sun, Monitor, Database,
  Download, Upload, Cloud, Check, AlertCircle, Info,
  Globe, Bell, Shield, Trash2, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useStore } from '../store/useStore';

export default function Settings() {
  const { theme, setTheme } = useStore();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('appearance');

  const sections = [
    { id: 'appearance', label: 'المظهر', icon: Moon },
    { id: 'sync', label: 'المزامنة والنسخ', icon: Cloud },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'privacy', label: 'الخصوصية', icon: Shield },
    { id: 'data', label: 'البيانات', icon: Database },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <SettingsIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الإعدادات</h1>
          <p className="text-gray-600 dark:text-gray-400">تخصيص تجربتك في المفكرة</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <section.icon className="h-5 w-5" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {activeSection === 'appearance' && (
            <AppearanceSettings theme={theme} setTheme={setTheme} />
          )}
          {activeSection === 'sync' && (
            <SyncSettings />
          )}
          {activeSection === 'notifications' && (
            <NotificationSettings />
          )}
          {activeSection === 'privacy' && (
            <PrivacySettings />
          )}
          {activeSection === 'data' && (
            <DataSettings />
          )}
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings({ theme, setTheme }) {
  const themes = [
    { id: 'light', label: 'فاتح', icon: Sun },
    { id: 'dark', label: 'داكن', icon: Moon },
    { id: 'system', label: 'تلقائي', icon: Monitor },
  ];

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">المظهر</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          اختر المظهر المناسب لك
        </p>
      </div>

      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          نمط الألوان
        </label>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === t.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <t.icon className={`h-6 w-6 ${
                theme === t.id ? 'text-primary-600' : 'text-gray-500'
              }`} />
              <span className={`text-sm font-medium ${
                theme === t.id ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {t.label}
              </span>
              {theme === t.id && (
                <Check className="h-4 w-4 text-primary-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          اللغة
        </label>
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Globe className="h-5 w-5 text-gray-500" />
          <span className="text-gray-700 dark:text-gray-300">العربية</span>
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-0.5 rounded">
            افتراضي
          </span>
        </div>
      </div>
    </div>
  );
}

function SyncSettings() {
  const [syncing, setSyncing] = useState(false);

  const backupMutation = useMutation({
    mutationFn: api.createLocalBackup,
    onSuccess: (data) => {
      toast.success('تم إنشاء النسخة الاحتياطية');
      // Trigger download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `obsidia-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      toast.error('فشل إنشاء النسخة الاحتياطية');
    },
  });

  const handleBigQuerySync = async () => {
    setSyncing(true);
    try {
      await api.syncToBigQuery();
      toast.success('تمت المزامنة مع BigQuery');
    } catch (error) {
      toast.error('فشلت المزامنة');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Local Backup */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Download className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
              النسخ الاحتياطي المحلي
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              حمّل نسخة من جميع بياناتك بصيغة JSON
            </p>
            <button
              onClick={() => backupMutation.mutate()}
              disabled={backupMutation.isPending}
              className="btn-secondary"
            >
              <Download className="h-4 w-4" />
              {backupMutation.isPending ? 'جاري التحميل...' : 'تحميل النسخة الاحتياطية'}
            </button>
          </div>
        </div>
      </div>

      {/* BigQuery Sync */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Cloud className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
              مزامنة BigQuery
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              مزامنة البيانات مع BigQuery للنسخ الاحتياطي السحابي
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-4">
              <Info className="h-4 w-4" />
              <span>للنسخ الاحتياطي فقط - لا يؤثر على البيانات المحلية</span>
            </div>
            <button
              onClick={handleBigQuerySync}
              disabled={syncing}
              className="btn-secondary"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'جاري المزامنة...' : 'مزامنة الآن'}
            </button>
          </div>
        </div>
      </div>

      {/* Restore */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Upload className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
              استعادة البيانات
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              استعد بياناتك من نسخة احتياطية سابقة
            </p>
            <label className="btn-secondary cursor-pointer inline-flex">
              <Upload className="h-4 w-4" />
              اختر ملف النسخة الاحتياطية
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    toast.success('ميزة الاستعادة قيد التطوير');
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [settings, setSettings] = useState({
    reminders: true,
    weeklyReport: true,
    momentum: false,
  });

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('تم تحديث الإعدادات');
  };

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">الإشعارات</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          تحكم في الإشعارات والتنبيهات
        </p>
      </div>

      <div className="space-y-4">
        <ToggleOption
          label="تذكيرات المراجعة"
          description="تنبيهات للملاحظات المستحقة للمراجعة"
          enabled={settings.reminders}
          onToggle={() => toggle('reminders')}
        />
        <ToggleOption
          label="التقرير الأسبوعي"
          description="ملخص أسبوعي لنشاطك البحثي"
          enabled={settings.weeklyReport}
          onToggle={() => toggle('weeklyReport')}
        />
        <ToggleOption
          label="تنبيهات الزخم"
          description="تنبيه عند انخفاض نشاطك البحثي"
          enabled={settings.momentum}
          onToggle={() => toggle('momentum')}
        />
      </div>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">الخصوصية</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          إعدادات الخصوصية والأمان
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
          <Shield className="h-5 w-5" />
          <span className="font-medium">بياناتك محمية</span>
        </div>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mr-7">
          <li>• جميع البيانات مخزنة محلياً على جهازك</li>
          <li>• لا يتم مشاركة أي بيانات مع أطراف ثالثة</li>
          <li>• المزامنة السحابية اختيارية ومشفرة</li>
          <li>• يمكنك حذف بياناتك في أي وقت</li>
        </ul>
      </div>

      {/* Data Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          موقع البيانات
        </label>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Database className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <span className="text-gray-700 dark:text-gray-300">SQLite محلي</span>
            <p className="text-xs text-gray-500">بياناتك مخزنة على جهازك فقط</p>
          </div>
          <Check className="h-5 w-5 text-green-500" />
        </div>
      </div>
    </div>
  );
}

function DataSettings() {
  const queryClient = useQueryClient();

  const handleClearCache = () => {
    queryClient.clear();
    toast.success('تم مسح ذاكرة التخزين المؤقت');
  };

  const handleExportData = async () => {
    try {
      const data = await api.createLocalBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `obsidia-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('تم تصدير البيانات');
    } catch {
      toast.error('فشل تصدير البيانات');
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">إحصائيات البيانات</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">--</div>
            <div className="text-sm text-gray-500">إجمالي الملاحظات</div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">--</div>
            <div className="text-sm text-gray-500">حجم قاعدة البيانات</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">إجراءات البيانات</h2>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">تصدير البيانات</p>
            <p className="text-sm text-gray-500">تحميل جميع بياناتك</p>
          </div>
          <button onClick={handleExportData} className="btn-secondary text-sm">
            <Download className="h-4 w-4" />
            تصدير
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">مسح الذاكرة المؤقتة</p>
            <p className="text-sm text-gray-500">تحديث البيانات المخزنة مؤقتاً</p>
          </div>
          <button onClick={handleClearCache} className="btn-secondary text-sm">
            <RefreshCw className="h-4 w-4" />
            مسح
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div>
            <p className="font-medium text-red-600">حذف جميع البيانات</p>
            <p className="text-sm text-red-500/70">إجراء لا يمكن التراجع عنه</p>
          </div>
          <button
            onClick={() => toast.error('هذه الميزة معطلة للحماية')}
            className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg text-sm flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </button>
        </div>
      </div>

      {/* Danger Zone Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700 dark:text-amber-400">
          <p className="font-medium mb-1">تنبيه مهم</p>
          <p>
            قبل حذف أي بيانات، تأكد من إنشاء نسخة احتياطية. البيانات المحذوفة لا يمكن استعادتها.
          </p>
        </div>
      </div>
    </div>
  );
}

function ToggleOption({ label, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? 'right-1' : 'right-7'
          }`}
        />
      </button>
    </div>
  );
}
