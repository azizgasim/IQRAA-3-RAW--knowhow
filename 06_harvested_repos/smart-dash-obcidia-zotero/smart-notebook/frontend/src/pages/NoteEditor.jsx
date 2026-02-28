/**
 * NoteEditor - محرر الملاحظات
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowRight, Tag, Link2, Trash2, Clock, Star, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import MarkdownEditor from '../components/MarkdownEditor';
import TagInput from '../components/TagInput';

export default function NoteEditor() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addRecentNote } = useStore();
  const isNew = !noteId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch note if editing
  const { data: note, isLoading: noteLoading } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => api.getNote(noteId),
    enabled: !isNew,
  });

  // Fetch projects
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });

  // Fetch links for existing note
  const { data: links } = useQuery({
    queryKey: ['note', noteId, 'links'],
    queryFn: () => api.getNoteLinks(noteId),
    enabled: !isNew && !!noteId,
  });

  const { data: backlinks } = useQuery({
    queryKey: ['note', noteId, 'backlinks'],
    queryFn: () => api.getNoteBacklinks(noteId),
    enabled: !isNew && !!noteId,
  });

  // Update fields when note loads
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      setProjectId(note.project_id?.toString() || '');
      addRecentNote(note.id);
    }
  }, [note, addRecentNote]);

  // Track changes
  useEffect(() => {
    if (note) {
      const changed =
        title !== note.title ||
        content !== note.content ||
        JSON.stringify(tags) !== JSON.stringify(note.tags || []) ||
        projectId !== (note.project_id?.toString() || '');
      setHasChanges(changed);
    } else if (isNew) {
      setHasChanges(!!title || !!content);
    }
  }, [title, content, tags, projectId, note, isNew]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isNew ? api.createNote(data) : api.updateNote(noteId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['notes']);
      queryClient.invalidateQueries(['note', data.id]);
      toast.success(isNew ? 'تم إنشاء الملاحظة' : 'تم حفظ التغييرات');
      if (isNew) {
        navigate(`/notes/${data.id}`, { replace: true });
      }
      setHasChanges(false);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحفظ');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      toast.success('تم حذف الملاحظة');
      navigate('/notes');
    },
  });

  // Favorite mutation
  const toggleFavorite = useMutation({
    mutationFn: () => api.updateNote(noteId, { is_favorite: !note?.is_favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries(['note', noteId]);
      toast.success(note?.is_favorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة');
    },
  });

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      toast.error('العنوان مطلوب');
      return;
    }
    if (!content.trim()) {
      toast.error('المحتوى مطلوب');
      return;
    }

    saveMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      tags,
      project_id: projectId ? parseInt(projectId) : null,
    });
  }, [title, content, tags, projectId, saveMutation]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Loading state
  if (noteLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
          رجوع
        </button>
        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <button
                onClick={() => toggleFavorite.mutate()}
                className={`p-2 rounded-lg transition-colors ${
                  note?.is_favorite
                    ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={note?.is_favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
              >
                <Star className={`h-5 w-5 ${note?.is_favorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => {
                  if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
                    deleteMutation.mutate();
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="حذف"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending || !hasChanges}
            className="btn-primary disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>

      {/* Editor Card */}
      <div className="card overflow-hidden">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان الملاحظة..."
          className="w-full px-6 py-4 text-2xl font-bold border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
        />

        {/* Metadata */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
          {/* Project */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">المشروع:</span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">بدون مشروع</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Tag className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <TagInput tags={tags} onChange={setTags} />
          </div>
        </div>

        {/* Content Editor */}
        <div className="p-6">
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="ابدأ الكتابة... (يدعم Markdown والروابط [[عنوان الملاحظة]])"
          />
        </div>

        {/* Footer Info */}
        {note && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                آخر تعديل: {new Date(note.updated_at).toLocaleString('ar-SA')}
              </span>
              <span className="flex items-center gap-1">
                <Link2 className="h-4 w-4" />
                {links?.length || 0} روابط صادرة • {backlinks?.length || 0} واردة
              </span>
              {note.review_count > 0 && (
                <span>
                  مراجعة رقم: {note.review_count}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Links Section */}
      {!isNew && (links?.length > 0 || backlinks?.length > 0) && (
        <div className="card p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">الروابط</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {links?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  صادرة ({links.length})
                </p>
                <div className="space-y-1">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="text-sm text-primary-600 dark:text-primary-400"
                    >
                      → {link.target_title}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {backlinks?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  واردة ({backlinks.length})
                </p>
                <div className="space-y-1">
                  {backlinks.map((link) => (
                    <div
                      key={link.id}
                      className="text-sm text-green-600 dark:text-green-400"
                    >
                      ← ملاحظة #{link.source_note_id}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
