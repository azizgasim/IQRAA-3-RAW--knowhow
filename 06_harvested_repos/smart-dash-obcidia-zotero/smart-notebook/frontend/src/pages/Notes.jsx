/**
 * Notes - صفحة الملاحظات
 */

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Grid, List, Tag, X } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import { useDebounce } from '../hooks/useDebounce';
import NoteCard from '../components/NoteCard';

export default function Notes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { notesViewMode, setNotesViewMode } = useStore();

  const debouncedSearch = useDebounce(searchInput, 300);

  const filters = {
    project_id: searchParams.get('project'),
    tag: searchParams.get('tag'),
    source: searchParams.get('source'),
  };

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', filters, debouncedSearch],
    queryFn: () => api.getNotes({ ...filters, search: debouncedSearch || undefined }),
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: api.getTags,
  });

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const hasActiveFilters = Object.values(filters).some((v) => v) || searchInput;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الملاحظات</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {notes?.length || 0} ملاحظة
          </p>
        </div>
        <Link to="/notes/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          ملاحظة جديدة
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث في الملاحظات..."
              className="input pr-10"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${
              showFilters || hasActiveFilters
                ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-900/30'
                : 'btn-secondary'
            }`}
          >
            <Filter className="h-4 w-4" />
            فلترة
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </button>

          {/* View Mode */}
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setNotesViewMode('grid')}
              className={`p-2.5 ${
                notesViewMode === 'grid'
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary-600'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              title="عرض شبكة"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setNotesViewMode('list')}
              className={`p-2.5 ${
                notesViewMode === 'list'
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary-600'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              title="عرض قائمة"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Tag className="h-4 w-4" />
                الوسوم:
              </span>
              {tags?.slice(0, 10).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    if (filters.tag === tag.name) {
                      searchParams.delete('tag');
                    } else {
                      searchParams.set('tag', tag.name);
                    }
                    setSearchParams(searchParams);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    filters.tag === tag.name
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    borderRight: `3px solid ${tag.color}`,
                  }}
                >
                  #{tag.name}
                </button>
              ))}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 rounded-full text-sm bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  مسح الفلاتر
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
        </div>
      ) : notes?.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {hasActiveFilters ? 'لا توجد نتائج' : 'لا توجد ملاحظات'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {hasActiveFilters
              ? 'جرب تغيير معايير البحث أو إزالة الفلاتر'
              : 'ابدأ بإضافة أول ملاحظة لك'}
          </p>
          {hasActiveFilters ? (
            <button onClick={clearFilters} className="btn-secondary">
              مسح الفلاتر
            </button>
          ) : (
            <Link to="/notes/new" className="btn-primary">
              <Plus className="h-4 w-4" />
              أضف أول ملاحظة
            </Link>
          )}
        </div>
      ) : (
        <div
          className={
            notesViewMode === 'grid'
              ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} viewMode={notesViewMode} />
          ))}
        </div>
      )}
    </div>
  );
}
