/**
 * Dashboard - لوحة التحكم الرئيسية
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Library, Book, FileText, Newspaper, GraduationCap,
  Star, Clock, TrendingUp, Plus, ArrowLeft,
  BookOpen, Eye, PenTool
} from 'lucide-react';
import { api } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const typeLabels = {
  book: 'كتب',
  article: 'مقالات',
  thesis: 'رسائل',
  chapter: 'فصول',
  conference: 'مؤتمرات',
  report: 'تقارير',
  webpage: 'مواقع',
  other: 'أخرى',
};

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats', 'library'],
    queryFn: api.getLibraryStats,
  });

  const { data: recentRefs } = useQuery({
    queryKey: ['references', { limit: 5 }],
    queryFn: () => api.getReferences({ limit: 5 }),
  });

  const { data: activity } = useQuery({
    queryKey: ['stats', 'activity'],
    queryFn: () => api.getActivityTimeline(14),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  const typeData = Object.entries(stats?.by_type || {}).map(([type, count]) => ({
    name: typeLabels[type] || type,
    value: count,
  }));

  const statusData = Object.entries(stats?.by_read_status || {}).map(([status, count]) => ({
    name: status === 'unread' ? 'لم يُقرأ' : status === 'reading' ? 'قيد القراءة' : status === 'read' ? 'مقروء' : 'مُتصفَّح',
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            مرحباً بك في زوتيرو الذكي
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            إدارة مراجعك البحثية بذكاء
          </p>
        </div>
        <Link to="/references/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          مرجع جديد
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Library}
          label="إجمالي المراجع"
          value={stats?.total_references || 0}
          color="primary"
        />
        <StatCard
          icon={Star}
          label="المفضلة"
          value={stats?.favorites_count || 0}
          color="yellow"
        />
        <StatCard
          icon={Eye}
          label="التعليقات"
          value={stats?.total_annotations || 0}
          color="blue"
        />
        <StatCard
          icon={PenTool}
          label="الملاحظات"
          value={stats?.total_notes || 0}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-500" />
            النشاط الأخير
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="date" tickFormatter={(d) => d?.split('-')[2]} stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="references_added"
                  stroke="#10b981"
                  fill="url(#colorRefs)"
                  name="مراجع جديدة"
                />
                <defs>
                  <linearGradient id="colorRefs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Book className="h-5 w-5 text-primary-500" />
            توزيع الأنواع
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {typeData.slice(0, 4).map((item, i) => (
              <div key={item.name} className="flex items-center gap-1 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent & Reading Status */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent References */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-500" />
              أحدث المراجع
            </h2>
            <Link to="/library" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              عرض الكل
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentRefs?.slice(0, 5).map((ref) => (
              <Link
                key={ref.id}
                to={`/references/${ref.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center type-${ref.type}`}>
                  {ref.type === 'book' ? <Book className="h-5 w-5" /> :
                   ref.type === 'article' ? <Newspaper className="h-5 w-5" /> :
                   ref.type === 'thesis' ? <GraduationCap className="h-5 w-5" /> :
                   <FileText className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                    {ref.title_ar || ref.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {ref.authors} {ref.year && `(${ref.year})`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Reading Status */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary-500" />
            حالة القراءة
          </h2>

          <div className="space-y-4">
            {statusData.map((item, i) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.value / (stats?.total_references || 1)) * 100}%`,
                      backgroundColor: COLORS[i % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Reading Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">
                  {stats?.total_reading_hours?.toFixed(1) || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">ساعات القراءة</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600">
                  {stats?.recent_additions || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">إضافات الشهر</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/references/new"
            className="flex flex-col items-center gap-2 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <Plus className="h-8 w-8 text-primary-600" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-400">إضافة مرجع</span>
          </Link>
          <Link
            to="/import"
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">استيراد ملف</span>
          </Link>
          <Link
            to="/search"
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <BookOpen className="h-8 w-8 text-purple-600" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">بحث متقدم</span>
          </Link>
          <Link
            to="/stats"
            className="flex flex-col items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-amber-600" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">الإحصائيات</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="card p-4">
      <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}
