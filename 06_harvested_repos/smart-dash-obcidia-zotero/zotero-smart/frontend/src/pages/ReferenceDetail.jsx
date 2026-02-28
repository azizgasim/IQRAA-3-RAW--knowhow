/**
 * ReferenceDetail - تفاصيل المرجع
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight, Edit2, Trash2, Star, Archive, Copy, ExternalLink,
  Book, FileText, Eye, Plus, Calendar, User, Building, Hash,
  Globe, BookOpen, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const statusLabels = {
  unread: 'لم يُقرأ',
  reading: 'قيد القراءة',
  read: 'مقروء',
  skimmed: 'مُتصفَّح',
};

export default function ReferenceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');
  const [showCitations, setShowCitations] = useState(false);

  const { data: reference, isLoading } = useQuery({
    queryKey: ['reference', id],
    queryFn: () => api.getReference(id),
  });

  const { data: annotations } = useQuery({
    queryKey: ['annotations', id],
    queryFn: () => api.getAnnotations(id),
    enabled: activeTab === 'annotations',
  });

  const { data: notes } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => api.getNotes(id),
    enabled: activeTab === 'notes',
  });

  const { data: citations } = useQuery({
    queryKey: ['citations', id],
    queryFn: () => api.getAllCitationFormats(id),
    enabled: showCitations,
  });

  const favoriteMutation = useMutation({
    mutationFn: () => api.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['reference', id]);
      toast.success(reference?.is_favorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteReference(id),
    onSuccess: () => {
      toast.success('تم حذف المرجع');
      navigate('/library');
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => api.updateReadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['reference', id]);
      toast.success('تم تحديث حالة القراءة');
    },
  });

  const sendToNotebookMutation = useMutation({
    mutationFn: () => api.sendToNotebook(id),
    onSuccess: () => {
      toast.success('تم الإرسال إلى المفكرة الذكية');
    },
  });

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (!reference) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">المرجع غير موجود</h2>
        <button onClick={() => navigate('/library')} className="btn-primary mt-4">
          العودة للمكتبة
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'المعلومات' },
    { id: 'annotations', label: `التعليقات (${reference.annotations_count || 0})` },
    { id: 'notes', label: `الملاحظات (${reference.notes_count || 0})` },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowRight className="h-5 w-5" />
          رجوع
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => favoriteMutation.mutate()}
            className={`p-2 rounded-lg transition-colors ${
              reference.is_favorite
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Star className={`h-5 w-5 ${reference.is_favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => sendToNotebookMutation.mutate()}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            title="إرسال للمفكرة الذكية"
          >
            <Send className="h-5 w-5" />
          </button>

          <Link
            to={`/references/${id}/edit`}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Edit2 className="h-5 w-5" />
          </Link>

          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من حذف هذا المرجع؟')) {
                deleteMutation.mutate();
              }
            }}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="card overflow-hidden">
        {/* Type Badge & Title */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center type-${reference.type}`}>
              <Book className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {reference.title_ar || reference.title}
              </h1>
              {reference.title_ar && reference.title && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{reference.title}</p>
              )}
              {reference.authors && (
                <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {reference.authors_ar || reference.authors}
                </p>
              )}
            </div>
          </div>

          {/* Status & Rating */}
          <div className="flex items-center gap-4 mt-4">
            <select
              value={reference.read_status}
              onChange={(e) => statusMutation.mutate(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium status-${reference.read_status}`}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => api.updateRating(id, star === reference.rating ? 0 : star)}
                  className={star <= reference.rating ? 'text-yellow-500' : 'text-gray-300'}
                >
                  ★
                </button>
              ))}
            </div>

            {reference.citation_key && (
              <button
                onClick={() => copyToClipboard(reference.citation_key, 'مفتاح الاقتباس')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <Hash className="h-4 w-4" />
                {reference.citation_key}
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Meta Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                {reference.year && (
                  <InfoItem icon={Calendar} label="السنة" value={reference.hijri_year || reference.year} />
                )}
                {reference.publisher && (
                  <InfoItem icon={Building} label="الناشر" value={reference.publisher} />
                )}
                {reference.journal && (
                  <InfoItem icon={FileText} label="المجلة" value={reference.journal} />
                )}
                {reference.volume && (
                  <InfoItem icon={BookOpen} label="المجلد" value={`${reference.volume}${reference.issue ? ` (${reference.issue})` : ''}`} />
                )}
                {reference.pages && (
                  <InfoItem icon={FileText} label="الصفحات" value={reference.pages} />
                )}
                {reference.doi && (
                  <InfoItem
                    icon={Globe}
                    label="DOI"
                    value={reference.doi}
                    link={`https://doi.org/${reference.doi}`}
                  />
                )}
                {reference.url && (
                  <InfoItem icon={ExternalLink} label="الرابط" value="فتح الرابط" link={reference.url} />
                )}
              </div>

              {/* Abstract */}
              {(reference.abstract || reference.abstract_ar) && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">الملخص</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {reference.abstract_ar || reference.abstract}
                  </p>
                </div>
              )}

              {/* Tags */}
              {reference.tags?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">الوسوم</h3>
                  <div className="flex flex-wrap gap-2">
                    {reference.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Collections */}
              {reference.collections?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">المجموعات</h3>
                  <div className="flex flex-wrap gap-2">
                    {reference.collections.map((coll) => (
                      <span
                        key={coll.id}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: coll.color + '20', color: coll.color }}
                      >
                        {coll.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Citations */}
              <div>
                <button
                  onClick={() => setShowCitations(!showCitations)}
                  className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white"
                >
                  <Copy className="h-4 w-4" />
                  تنسيقات الاقتباس
                </button>
                {showCitations && citations && (
                  <div className="mt-3 space-y-3">
                    {Object.entries(citations).map(([style, citation]) => (
                      <div key={style} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-500 uppercase">{style}</span>
                          <button
                            onClick={() => copyToClipboard(citation, style.toUpperCase())}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{citation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                <p>تاريخ الإضافة: {formatDistanceToNow(new Date(reference.created_at), { locale: ar, addSuffix: true })}</p>
                <p>آخر تعديل: {formatDistanceToNow(new Date(reference.updated_at), { locale: ar, addSuffix: true })}</p>
              </div>
            </div>
          )}

          {activeTab === 'annotations' && (
            <div className="space-y-4">
              {annotations?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>لا توجد تعليقات</p>
                </div>
              ) : (
                annotations?.map((ann) => (
                  <div key={ann.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-r-4" style={{ borderColor: ann.color }}>
                    {ann.content && <p className="text-gray-700 dark:text-gray-300">{ann.content}</p>}
                    {ann.comment && <p className="text-sm text-gray-500 mt-2">{ann.comment}</p>}
                    {ann.page_number && <p className="text-xs text-gray-400 mt-2">صفحة {ann.page_number}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {notes?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>لا توجد ملاحظات</p>
                </div>
              ) : (
                notes?.map((note) => (
                  <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {note.title && <h4 className="font-medium text-gray-900 dark:text-white mb-2">{note.title}</h4>}
                    <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(note.created_at), { locale: ar, addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, link }) {
  const content = (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
        {content}
      </a>
    );
  }

  return content;
}
