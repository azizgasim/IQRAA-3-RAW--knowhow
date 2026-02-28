/**
 * ReferenceCard - بطاقة المرجع
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star, Book, FileText, GraduationCap, Newspaper,
  Globe, File, MoreVertical, Trash2, Edit2, Copy,
  BookOpen, CheckCircle, Clock, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useStore } from '../store/useStore';

const typeIcons = {
  book: Book,
  article: Newspaper,
  thesis: GraduationCap,
  chapter: FileText,
  conference: FileText,
  report: File,
  webpage: Globe,
  other: File,
};

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

const statusLabels = {
  unread: 'لم يُقرأ',
  reading: 'قيد القراءة',
  read: 'مقروء',
  skimmed: 'مُتصفَّح',
};

export default function ReferenceCard({ reference, viewMode = 'grid' }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toggleSelectReference, selectedReferences } = useStore();
  const [showMenu, setShowMenu] = React.useState(false);

  const isSelected = selectedReferences.includes(reference.id);
  const TypeIcon = typeIcons[reference.type] || File;

  const favoriteMutation = useMutation({
    mutationFn: () => api.toggleFavorite(reference.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['references']);
      toast.success(reference.is_favorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteReference(reference.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['references']);
      toast.success('تم حذف المرجع');
    },
  });

  const handleCopyCitation = async () => {
    try {
      const citations = await api.getAllCitationFormats(reference.id);
      navigator.clipboard.writeText(citations.apa);
      toast.success('تم نسخ الاقتباس (APA)');
    } catch {
      toast.error('فشل نسخ الاقتباس');
    }
    setShowMenu(false);
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`card p-4 hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-primary-500' : ''
        }`}
        onClick={() => navigate(`/references/${reference.id}`)}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center type-${reference.type}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSelectReference(reference.id);
            }}
          >
            <TypeIcon className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {reference.title_ar || reference.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
              {reference.authors}
              {reference.year && ` (${reference.year})`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs status-${reference.read_status}`}>
              {statusLabels[reference.read_status]}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                favoriteMutation.mutate();
              }}
              className={`p-1 rounded ${
                reference.is_favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
              }`}
            >
              <Star className={`h-5 w-5 ${reference.is_favorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={`card overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      }`}
      onClick={() => navigate(`/references/${reference.id}`)}
    >
      {/* Header with type badge */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 type-${reference.type}`}>
            <TypeIcon className="h-3 w-3" />
            {typeLabels[reference.type]}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                favoriteMutation.mutate();
              }}
              className={`p-1 rounded transition-colors ${
                reference.is_favorite
                  ? 'text-yellow-500'
                  : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-yellow-500'
              }`}
            >
              <Star className={`h-4 w-4 ${reference.is_favorite ? 'fill-current' : ''}`} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 rounded"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <div
                  className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[140px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      navigate(`/references/${reference.id}/edit`);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    تعديل
                  </button>
                  <button
                    onClick={handleCopyCitation}
                    className="w-full px-3 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    نسخ الاقتباس
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف هذا المرجع؟')) {
                        deleteMutation.mutate();
                      }
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
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-white mt-3 line-clamp-2 leading-tight">
          {reference.title_ar || reference.title}
        </h3>

        {/* Authors */}
        {reference.authors && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-1">
            {reference.authors_ar || reference.authors}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {reference.year && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {reference.hijri_year || reference.year}
              </span>
            )}
          </div>

          <span className={`px-2 py-0.5 rounded text-xs status-${reference.read_status}`}>
            {statusLabels[reference.read_status]}
          </span>
        </div>

        {/* Tags */}
        {reference.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {reference.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
            {reference.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{reference.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          {reference.annotations_count > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {reference.annotations_count}
            </span>
          )}
          {reference.notes_count > 0 && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {reference.notes_count}
            </span>
          )}
          {reference.rating > 0 && (
            <span className="flex items-center gap-1">
              {'★'.repeat(reference.rating)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
