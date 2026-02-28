/**
 * RecentNotes - آخر الملاحظات
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function RecentNotes({ notes }) {
  if (!notes) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">آخر الملاحظات</h3>
        <Link
          to="/notes"
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          عرض الكل
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>

      {/* Notes List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {notes.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">لا توجد ملاحظات بعد</p>
            <Link
              to="/notes/new"
              className="btn-primary inline-flex"
            >
              <Plus className="h-4 w-4" />
              أضف أول ملاحظة
            </Link>
          </div>
        ) : (
          notes.slice(0, 5).map((note) => (
            <Link
              key={note.id}
              to={`/notes/${note.id}`}
              className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                <FileText className="h-4 w-4 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {note.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {note.content.replace(/[#*`\[\]]/g, '').substring(0, 100)}
                </p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {formatDistanceToNow(new Date(note.updated_at), {
                  addSuffix: true,
                  locale: ar,
                })}
              </span>
            </Link>
          ))
        )}
      </div>

      {/* Quick Add */}
      {notes.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
          <Link
            to="/notes/new"
            className="flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus className="h-4 w-4" />
            ملاحظة جديدة
          </Link>
        </div>
      )}
    </div>
  );
}
