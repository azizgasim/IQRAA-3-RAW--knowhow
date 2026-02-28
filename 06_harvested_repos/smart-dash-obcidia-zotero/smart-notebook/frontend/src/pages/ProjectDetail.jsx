/**
 * ProjectDetail - تفاصيل المشروع البحثي
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight, Plus, FileText, HelpCircle, Quote, Target,
  CheckCircle2, Circle, Clock, Edit2, Trash2, ChevronDown, ChevronUp,
  Lightbulb, Flag, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const questionPriorityConfig = {
  high: { label: 'عالية', color: 'text-red-600', icon: AlertCircle },
  medium: { label: 'متوسطة', color: 'text-yellow-600', icon: Flag },
  low: { label: 'منخفضة', color: 'text-gray-500', icon: Circle },
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('notes');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.getProject(projectId),
  });

  const { data: notes } = useQuery({
    queryKey: ['notes', { project_id: projectId }],
    queryFn: () => api.getNotes({ project_id: projectId }),
  });

  const { data: questions } = useQuery({
    queryKey: ['project', projectId, 'questions'],
    queryFn: () => api.getProjectQuestions(projectId),
  });

  const { data: journey } = useQuery({
    queryKey: ['project', projectId, 'journey'],
    queryFn: () => api.getProjectJourney(projectId),
  });

  const createQuestionMutation = useMutation({
    mutationFn: (data) => api.createQuestion({ ...data, project_id: parseInt(projectId) }),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId, 'questions']);
      toast.success('تم إضافة السؤال');
      setShowQuestionModal(false);
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId, 'questions']);
      toast.success('تم تحديث السؤال');
      setEditingQuestion(null);
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: api.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId, 'questions']);
      toast.success('تم حذف السؤال');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">المشروع غير موجود</h2>
        <button onClick={() => navigate('/projects')} className="btn-primary mt-4">
          العودة للمشاريع
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'notes', label: 'الملاحظات', icon: FileText, count: notes?.length || 0 },
    { id: 'questions', label: 'الأسئلة', icon: HelpCircle, count: questions?.length || 0 },
    { id: 'journey', label: 'الرحلة', icon: Target, count: journey?.milestones?.length || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
          )}
        </div>
      </div>

      {/* Goal Card */}
      {project.goal && (
        <div className="card p-4 bg-gradient-to-l from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-800 border-r-4 border-primary-500">
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-400 mb-1">
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">الهدف</span>
          </div>
          <p className="text-gray-900 dark:text-white">{project.goal}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'notes' && (
        <NotesTab notes={notes} projectId={projectId} navigate={navigate} />
      )}

      {activeTab === 'questions' && (
        <QuestionsTab
          questions={questions}
          onAdd={() => setShowQuestionModal(true)}
          onEdit={setEditingQuestion}
          onDelete={(id) => {
            if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
              deleteQuestionMutation.mutate(id);
            }
          }}
          onToggleStatus={(q) => {
            updateQuestionMutation.mutate({
              id: q.id,
              data: { status: q.status === 'answered' ? 'open' : 'answered' },
            });
          }}
        />
      )}

      {activeTab === 'journey' && (
        <JourneyTab journey={journey} projectId={projectId} />
      )}

      {/* Question Modal */}
      {(showQuestionModal || editingQuestion) && (
        <QuestionModal
          question={editingQuestion}
          onClose={() => {
            setShowQuestionModal(false);
            setEditingQuestion(null);
          }}
          onSave={(data) => {
            if (editingQuestion) {
              updateQuestionMutation.mutate({ id: editingQuestion.id, data });
            } else {
              createQuestionMutation.mutate(data);
            }
          }}
          isLoading={createQuestionMutation.isPending || updateQuestionMutation.isPending}
        />
      )}
    </div>
  );
}

function NotesTab({ notes, projectId, navigate }) {
  if (!notes?.length) {
    return (
      <div className="card p-8 text-center">
        <FileText className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">لا توجد ملاحظات</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          أضف ملاحظات لهذا المشروع
        </p>
        <Link
          to={`/notes/new?project=${projectId}`}
          className="btn-primary inline-flex"
        >
          <Plus className="h-4 w-4" />
          ملاحظة جديدة
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          to={`/notes/new?project=${projectId}`}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          ملاحظة جديدة
        </Link>
      </div>
      <div className="space-y-2">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => navigate(`/notes/${note.id}`)}
            className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <h4 className="font-medium text-gray-900 dark:text-white">{note.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {note.content?.slice(0, 150)}...
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(note.updated_at), { locale: ar, addSuffix: true })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionsTab({ questions, onAdd, onEdit, onDelete, onToggleStatus }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openQuestions = questions?.filter((q) => q.status !== 'answered') || [];
  const answeredQuestions = questions?.filter((q) => q.status === 'answered') || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={onAdd} className="btn-primary">
          <Plus className="h-4 w-4" />
          سؤال جديد
        </button>
      </div>

      {!questions?.length ? (
        <div className="card p-8 text-center">
          <HelpCircle className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">لا توجد أسئلة</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            سجّل الأسئلة البحثية التي تطرحها خلال مشروعك
          </p>
        </div>
      ) : (
        <>
          {/* Open Questions */}
          {openQuestions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                أسئلة مفتوحة ({openQuestions.length})
              </h3>
              {openQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  expanded={expanded[q.id]}
                  onToggleExpand={() => toggleExpand(q.id)}
                  onEdit={() => onEdit(q)}
                  onDelete={() => onDelete(q.id)}
                  onToggleStatus={() => onToggleStatus(q)}
                />
              ))}
            </div>
          )}

          {/* Answered Questions */}
          {answeredQuestions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                أسئلة مُجابة ({answeredQuestions.length})
              </h3>
              {answeredQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  expanded={expanded[q.id]}
                  onToggleExpand={() => toggleExpand(q.id)}
                  onEdit={() => onEdit(q)}
                  onDelete={() => onDelete(q.id)}
                  onToggleStatus={() => onToggleStatus(q)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function QuestionCard({ question, expanded, onToggleExpand, onEdit, onDelete, onToggleStatus }) {
  const priority = questionPriorityConfig[question.priority] || questionPriorityConfig.medium;
  const PriorityIcon = priority.icon;
  const isAnswered = question.status === 'answered';

  return (
    <div className={`card p-4 ${isAnswered ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleStatus}
          className={`mt-0.5 ${isAnswered ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
        >
          {isAnswered ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <PriorityIcon className={`h-4 w-4 ${priority.color}`} />
            <span className={`text-xs ${priority.color}`}>{priority.label}</span>
          </div>
          <h4 className={`font-medium text-gray-900 dark:text-white ${isAnswered ? 'line-through' : ''}`}>
            {question.question}
          </h4>

          {question.answer && (
            <div className="mt-2">
              <button
                onClick={onToggleExpand}
                className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1"
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {expanded ? 'إخفاء الإجابة' : 'عرض الإجابة'}
              </button>
              {expanded && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                  {question.answer}
                </div>
              )}
            </div>
          )}

          {question.insight && (
            <div className="mt-2 flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
              <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{question.insight}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function JourneyTab({ journey, projectId }) {
  if (!journey?.milestones?.length) {
    return (
      <div className="card p-8 text-center">
        <Target className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">لا توجد محطات</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          سيتم تسجيل محطات رحلتك البحثية تلقائياً
        </p>
      </div>
    );
  }

  const milestoneIcons = {
    start: Target,
    breakthrough: Lightbulb,
    completion: CheckCircle2,
    insight: Lightbulb,
    other: Flag,
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-6">
        {journey.milestones.map((milestone, index) => {
          const Icon = milestoneIcons[milestone.type] || milestoneIcons.other;
          return (
            <div key={milestone.id} className="relative flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center z-10">
                <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="card p-4 flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h4>
                {milestone.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {milestone.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {formatDistanceToNow(new Date(milestone.created_at), { locale: ar, addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuestionModal({ question, onClose, onSave, isLoading }) {
  const [text, setText] = useState(question?.question || '');
  const [priority, setPriority] = useState(question?.priority || 'medium');
  const [answer, setAnswer] = useState(question?.answer || '');
  const [insight, setInsight] = useState(question?.insight || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('السؤال مطلوب');
      return;
    }
    onSave({
      question: text.trim(),
      priority,
      answer: answer.trim() || null,
      insight: insight.trim() || null,
      status: answer.trim() ? 'answered' : 'open',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {question ? 'تعديل السؤال' : 'سؤال جديد'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              السؤال *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ما السؤال البحثي الذي تريد الإجابة عليه؟"
              rows={2}
              className="input w-full resize-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الأولوية
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input w-full"
            >
              <option value="high">عالية</option>
              <option value="medium">متوسطة</option>
              <option value="low">منخفضة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الإجابة (اختياري)
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="إذا وجدت الإجابة، سجّلها هنا..."
              rows={3}
              className="input w-full resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              رؤية أو استنتاج (اختياري)
            </label>
            <input
              type="text"
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              placeholder="أي استنتاج أو رؤية توصلت إليها..."
              className="input w-full"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1"
            >
              {isLoading ? 'جاري الحفظ...' : question ? 'تحديث' : 'إضافة'}
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
