/**
 * Cognitive - المرآة المعرفية (الذكاء الصامت)
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Brain, TrendingUp, TrendingDown, Minus, Calendar,
  Target, FileText, HelpCircle, Tag, Clock, Lightbulb,
  BarChart3, PieChart, Activity, Sparkles, BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

export default function Cognitive() {
  const [period, setPeriod] = useState(7);

  const { data: mirror, isLoading: mirrorLoading } = useQuery({
    queryKey: ['cognitive', 'mirror'],
    queryFn: api.getCognitiveMirror,
  });

  const { data: momentum } = useQuery({
    queryKey: ['cognitive', 'momentum'],
    queryFn: api.getMomentum,
  });

  const { data: weeklyReport } = useQuery({
    queryKey: ['cognitive', 'weekly-report'],
    queryFn: api.getWeeklyReport,
  });

  const { data: patterns } = useQuery({
    queryKey: ['cognitive', 'patterns'],
    queryFn: api.getPatterns,
  });

  if (mirrorLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              المرآة المعرفية
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              وعيك بنشاطك البحثي
            </p>
          </div>
        </div>
      </div>

      {/* Philosophy Banner */}
      <div className="card p-4 bg-gradient-to-l from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800 border-r-4 border-amber-500">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">فلسفة الذكاء الصامت</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          "ليست عقلاً بل وعياً بالعقل" - المفكرة تراقب بصمت، تهمس أحياناً، وتنصح نادراً
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="الملاحظات"
          value={mirror?.total_notes || 0}
          color="blue"
        />
        <StatCard
          icon={HelpCircle}
          label="الأسئلة"
          value={mirror?.total_questions || 0}
          subValue={`${mirror?.answered_questions || 0} مُجابة`}
          color="purple"
        />
        <StatCard
          icon={Target}
          label="المشاريع النشطة"
          value={mirror?.active_projects || 0}
          color="green"
        />
        <StatCard
          icon={Tag}
          label="الوسوم"
          value={mirror?.total_tags || 0}
          color="amber"
        />
      </div>

      {/* Momentum & Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Research Momentum */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-500" />
              الزخم البحثي
            </h2>
            <MomentumBadge trend={momentum?.trend} />
          </div>

          <div className="text-center py-6">
            <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {momentum?.score || 0}
            </div>
            <p className="text-gray-500 dark:text-gray-400">درجة الزخم</p>
          </div>

          <div className="space-y-3">
            <ProgressBar
              label="ملاحظات هذا الأسبوع"
              value={momentum?.notes_this_week || 0}
              max={momentum?.notes_last_week || 1}
              color="blue"
            />
            <ProgressBar
              label="أيام النشاط"
              value={momentum?.active_days || 0}
              max={7}
              color="green"
            />
            <ProgressBar
              label="سلسلة الاستمرارية"
              value={momentum?.streak || 0}
              max={30}
              color="amber"
            />
          </div>
        </div>

        {/* Activity Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-500" />
              نشاط الأيام
            </h2>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800"
            >
              <option value={7}>7 أيام</option>
              <option value={14}>14 يوم</option>
              <option value={30}>30 يوم</option>
            </select>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generateActivityData(period)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => format(new Date(d), 'E', { locale: ar })}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  labelFormatter={(d) => format(new Date(d), 'EEEE، d MMMM', { locale: ar })}
                />
                <Area
                  type="monotone"
                  dataKey="notes"
                  stroke="#6366f1"
                  fill="url(#colorNotes)"
                  name="ملاحظات"
                />
                <defs>
                  <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly Report & Patterns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Report */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary-500" />
            التقرير الأسبوعي
          </h2>

          {weeklyReport ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{weeklyReport.notes_created}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">ملاحظات جديدة</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{weeklyReport.questions_answered}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">أسئلة أُجيبت</div>
                </div>
              </div>

              {weeklyReport.top_tags?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">الوسوم الأكثر استخداماً</p>
                  <div className="flex flex-wrap gap-2">
                    {weeklyReport.top_tags.slice(0, 5).map((tag, i) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {weeklyReport.insight && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1">
                    <Lightbulb className="h-4 w-4" />
                    <span className="text-sm font-medium">همسة</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{weeklyReport.insight}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              لا يوجد تقرير متاح
            </div>
          )}
        </div>

        {/* Patterns & Insights */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            الأنماط والرؤى
          </h2>

          {patterns?.length > 0 ? (
            <div className="space-y-3">
              {patterns.map((pattern, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      pattern.type === 'positive' ? 'bg-green-500' :
                      pattern.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {pattern.title}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pattern.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                استمر في الكتابة وسأكتشف أنماطك البحثية
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Top Tags Distribution */}
      {mirror?.top_tags?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-primary-500" />
            توزيع الاهتمامات
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={mirror.top_tags.slice(0, 5).map((tag, i) => ({
                      name: tag.name,
                      value: tag.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mirror.top_tags.slice(0, 5).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-center space-y-3">
              {mirror.top_tags.slice(0, 5).map((tag, i) => (
                <div key={tag.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="flex-1 text-gray-700 dark:text-gray-300">{tag.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{tag.count} ملاحظة</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reading/Review Schedule */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary-500" />
          جدول المراجعة المتباعدة
        </h2>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{mirror?.due_today || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">مستحقة اليوم</div>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{mirror?.due_this_week || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">هذا الأسبوع</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{mirror?.reviewed_this_week || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">تمت مراجعتها</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subValue, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="card p-4">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      {subValue && (
        <div className="text-xs text-gray-400 mt-1">{subValue}</div>
      )}
    </div>
  );
}

function MomentumBadge({ trend }) {
  const config = {
    rising: { icon: TrendingUp, label: 'صاعد', color: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
    falling: { icon: TrendingDown, label: 'هابط', color: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
    stable: { icon: Minus, label: 'مستقر', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800' },
  };

  const { icon: Icon, label, color } = config[trend] || config.stable;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${color}`}>
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}

function ProgressBar({ label, value, max, color }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-gray-900 dark:text-white font-medium">{value}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function generateActivityData(days) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    data.push({
      date: subDays(new Date(), i).toISOString(),
      notes: Math.floor(Math.random() * 5),
    });
  }
  return data;
}
