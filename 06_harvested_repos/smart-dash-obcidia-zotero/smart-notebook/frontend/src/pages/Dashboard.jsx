/**
 * Dashboard - لوحة التحكم الرئيسية
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  FolderOpen,
  HelpCircle,
  Link2,
  Plus,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import MomentumCard from '../components/MomentumCard';
import RecentNotes from '../components/RecentNotes';
import DueReminders from '../components/DueReminders';

export default function Dashboard() {
  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  });

  // Fetch momentum
  const { data: momentum } = useQuery({
    queryKey: ['momentum'],
    queryFn: api.getMomentum,
  });

  // Fetch recent notes
  const { data: recentNotes } = useQuery({
    queryKey: ['notes', 'recent'],
    queryFn: () => api.getNotes({ limit: 5 }),
  });

  // Fetch due reminders
  const { data: dueReminders } = useQuery({
    queryKey: ['reminders', 'due'],
    queryFn: api.getDueReminders,
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-4 right-4 w-40 h-40 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-primary-100 text-sm">المفكرة الذكية الشخصية</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">مرحباً بك في Obsidia</h1>
          <p className="text-primary-100 mb-6 max-w-lg">
            امتداد رقمي لذاكرتك وتفكيرك. سجّل أفكارك، اربطها، وراقب تطور رحلتك البحثية.
          </p>
          <Link
            to="/notes/new"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-5 py-2.5 rounded-xl font-medium hover:bg-primary-50 transition-colors shadow-lg"
          >
            <Plus className="h-4 w-4" />
            ملاحظة جديدة
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="الملاحظات"
          value={stats?.total_notes || 0}
          icon={FileText}
          color="blue"
          href="/notes"
        />
        <StatCard
          title="المشاريع"
          value={stats?.total_projects || 0}
          icon={FolderOpen}
          color="green"
          href="/projects"
        />
        <StatCard
          title="الأسئلة المفتوحة"
          value={stats?.open_questions || 0}
          icon={HelpCircle}
          color="yellow"
        />
        <StatCard
          title="الروابط"
          value={stats?.total_links || 0}
          icon={Link2}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Momentum Card */}
        <div className="lg:col-span-1">
          <MomentumCard momentum={momentum} />
        </div>

        {/* Recent Notes */}
        <div className="lg:col-span-2">
          <RecentNotes notes={recentNotes} />
        </div>
      </div>

      {/* Due Reminders */}
      <DueReminders reminders={dueReminders} />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, href }) {
  const colors = {
    blue: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const Card = href ? Link : 'div';
  const cardProps = href ? { to: href } : {};

  return (
    <Card
      {...cardProps}
      className={`card p-4 ${href ? 'hover:shadow-md cursor-pointer' : ''} transition-shadow`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}
