/**
 * Stats - الإحصائيات والتحليلات
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  BookOpen, Users, Calendar, Tag, TrendingUp,
  Clock, Star, Archive, Eye, BookMarked
} from 'lucide-react';
import { api } from '../services/api';

export default function Stats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  });

  const { data: readingStats } = useQuery({
    queryKey: ['reading-stats'],
    queryFn: api.getReadingStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner" />
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

  const typeLabels = {
    book: 'كتاب',
    article: 'مقالة',
    thesis: 'رسالة',
    chapter: 'فصل',
    conference: 'مؤتمر',
    report: 'تقرير',
    webpage: 'موقع',
    other: 'آخر',
  };

  const readStatusLabels = {
    unread: 'لم يُقرأ',
    reading: 'قيد القراءة',
    read: 'تمت القراءة',
  };

  // Prepare data for charts
  const typeData = stats?.by_type?.map(item => ({
    name: typeLabels[item.type] || item.type,
    value: item.count,
  })) || [];

  const yearData = stats?.by_year?.slice(-15).map(item => ({
    year: item.year,
    count: item.count,
  })) || [];

  const languageData = stats?.by_language?.map(item => ({
    name: item.language === 'ar' ? 'العربية' : item.language === 'en' ? 'الإنجليزية' : item.language,
    value: item.count,
  })) || [];

  const readStatusData = stats?.by_read_status?.map(item => ({
    name: readStatusLabels[item.status] || item.status,
    value: item.count,
  })) || [];

  const monthlyData = stats?.monthly_additions?.map(item => ({
    month: item.month,
    added: item.count,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الإحصائيات</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          نظرة شاملة على مكتبتك وأنشطة القراءة
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.total_references || 0}
              </p>
              <p className="text-xs text-gray-500">إجمالي المراجع</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.total_authors || 0}
              </p>
              <p className="text-xs text-gray-500">المؤلفون</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Tag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.total_tags || 0}
              </p>
              <p className="text-xs text-gray-500">الوسوم</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.favorites_count || 0}
              </p>
              <p className="text-xs text-gray-500">المفضلة</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.read_count || 0}
              </p>
              <p className="text-xs text-gray-500">تمت قراءتها</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Types Distribution */}
        <div className="card p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-gray-400" />
            توزيع أنواع المراجع
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Read Status */}
        <div className="card p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-gray-400" />
            حالة القراءة
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={readStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#ef4444" /> {/* unread - red */}
                  <Cell fill="#f59e0b" /> {/* reading - amber */}
                  <Cell fill="#10b981" /> {/* read - green */}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Publications by Year */}
        <div className="card p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            المراجع حسب سنة النشر
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" name="عدد المراجع" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Additions */}
        <div className="card p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-400" />
            الإضافات الشهرية
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="added"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="مراجع جديدة"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Language Distribution */}
      <div className="card p-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          توزيع اللغات
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {languageData.map((lang, index) => (
            <div key={lang.name} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="flex-1 text-gray-900 dark:text-white">{lang.name}</span>
              <span className="font-medium text-gray-600 dark:text-gray-400">{lang.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reading Statistics */}
      {readingStats && (
        <div className="card p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            إحصائيات القراءة
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-3xl font-bold text-primary-600">{readingStats.total_reading_time || 0}</p>
              <p className="text-sm text-gray-500 mt-1">دقيقة قراءة</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">{readingStats.avg_reading_time || 0}</p>
              <p className="text-sm text-gray-500 mt-1">متوسط وقت القراءة (دقيقة)</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600">{readingStats.total_annotations || 0}</p>
              <p className="text-sm text-gray-500 mt-1">التعليقات التوضيحية</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-3xl font-bold text-amber-600">{readingStats.total_notes || 0}</p>
              <p className="text-sm text-gray-500 mt-1">الملاحظات</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Tags */}
      {stats?.top_tags?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-gray-400" />
            أكثر الوسوم استخداماً
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.top_tags.map((tag, index) => (
              <span
                key={tag.name}
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${COLORS[index % COLORS.length]}20`,
                  color: COLORS[index % COLORS.length],
                }}
              >
                {tag.name}
                <span className="mr-1 opacity-60">({tag.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Authors */}
      {stats?.top_authors?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            أكثر المؤلفين
          </h3>
          <div className="space-y-3">
            {stats.top_authors.slice(0, 10).map((author, index) => (
              <div key={author.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="flex-1 text-gray-900 dark:text-white">{author.name}</span>
                <span className="text-gray-500">{author.count} مراجع</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
