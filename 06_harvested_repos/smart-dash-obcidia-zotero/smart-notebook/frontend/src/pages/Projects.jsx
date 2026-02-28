/**
 * Projects - إدارة المشاريع البحثية
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, FolderOpen, Search, Filter, MoreVertical,
  CheckCircle2, Clock, Pause, Archive, Trash2, Edit2,
  FileText, HelpCircle, Quote, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const statusConfig = {
  active: { label: 'نشط', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  planning: { label: 'تخطيط', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Target },
  paused: { label: 'متوقف', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Pause },
  completed: { label: 'مكتمل', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: Archive },
};

export default function Projects() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });

  const createMutation = useMutation({
    mutationFn: api.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('تم إنشاء المشروع');
      setShowNewModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('تم تحديث المشروع');
      setEditingProject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('تم حذف المشروع');
    },
  });

  const filteredProjects = projects?.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المشاريع البحثية</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {projects?.length || 0} مشروع
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          مشروع جديد
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في المشاريع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pr-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="planning">تخطيط</option>
            <option value="paused">متوقف</option>
            <option value="completed">مكتمل</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects?.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد مشاريع
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            ابدأ بإنشاء مشروعك البحثي الأول
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            إنشاء مشروع
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => navigate(`/projects/${project.id}`)}
              onEdit={() => setEditingProject(project)}
              onDelete={() => {
                if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
                  deleteMutation.mutate(project.id);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* New/Edit Project Modal */}
      {(showNewModal || editingProject) && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setShowNewModal(false);
            setEditingProject(null);
          }}
          onSave={(data) => {
            if (editingProject) {
              updateMutation.mutate({ id: editingProject.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, onOpen, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const status = statusConfig[project.status] || statusConfig.active;
  const StatusIcon = status.icon;

  return (
    <div
      className="card p-4 hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
          {showMenu && (
            <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                تعديل
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                حذف
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
        {project.name}
      </h3>

      {project.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {project.notes_count || 0}
        </span>
        <span className="flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5" />
          {project.questions_count || 0}
        </span>
        <span className="flex items-center gap-1">
          <Quote className="h-3.5 w-3.5" />
          {project.quotations_count || 0}
        </span>
      </div>

      {project.updated_at && (
        <p className="text-xs text-gray-400 mt-3">
          آخر تحديث: {formatDistanceToNow(new Date(project.updated_at), { locale: ar, addSuffix: true })}
        </p>
      )}
    </div>
  );
}

function ProjectModal({ project, onClose, onSave, isLoading }) {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [status, setStatus] = useState(project?.status || 'active');
  const [goal, setGoal] = useState(project?.goal || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('اسم المشروع مطلوب');
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
      status,
      goal: goal.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {project ? 'تعديل المشروع' : 'مشروع جديد'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              اسم المشروع *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: دراسة أصول الفقه"
              className="input w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الوصف
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر للمشروع..."
              rows={3}
              className="input w-full resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الهدف
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="ما الهدف النهائي من هذا المشروع؟"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الحالة
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input w-full"
            >
              <option value="planning">تخطيط</option>
              <option value="active">نشط</option>
              <option value="paused">متوقف</option>
              <option value="completed">مكتمل</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1"
            >
              {isLoading ? 'جاري الحفظ...' : project ? 'تحديث' : 'إنشاء'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
