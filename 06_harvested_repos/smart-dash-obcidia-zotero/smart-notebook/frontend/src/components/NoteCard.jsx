/**
 * NoteCard - بطاقة الملاحظة
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Tag, Link2, Clock, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function NoteCard({ note, viewMode = 'grid' }) {
  const timeAgo = formatDistanceToNow(new Date(note.updated_at), {
    addSuffix: true,
    locale: ar,
  });

  if (viewMode === 'list') {
    return (
      <Link
        to={`/notes/${note.id}`}
        className="block card p-4 hover:shadow-md transition-all duration-200 group"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
            <FileText className="h-5 w-5 text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                {note.title}
              </h3>
              {note.is_favorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
              {note.content.replace(/[#*`\[\]]/g, '').substring(0, 150)}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
              {note.links_count > 0 && (
                <span className="flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  {note.links_count}
                </span>
              )}
              {note.tags?.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {note.tags.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link
      to={`/notes/${note.id}`}
      className="block card p-4 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors flex-1">
          {note.title}
        </h3>
        {note.is_favorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0 mr-2" />}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-3">
        {note.content.replace(/[#*`\[\]]/g, '').substring(0, 200)}
      </p>

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {note.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-xs text-gray-400 self-center">+{note.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </span>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {note.links_count > 0 && (
            <span className="flex items-center gap-1" title="روابط صادرة">
              <Link2 className="h-3 w-3 text-primary-400" />
              {note.links_count}
            </span>
          )}
          {note.backlinks_count > 0 && (
            <span className="flex items-center gap-1 text-green-500" title="روابط واردة">
              <Link2 className="h-3 w-3 rotate-180" />
              {note.backlinks_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
