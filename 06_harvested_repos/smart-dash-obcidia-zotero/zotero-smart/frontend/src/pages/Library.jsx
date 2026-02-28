/**
 * Library - المكتبة
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, Filter, Grid3X3, List, SlidersHorizontal,
  Book, Star, Archive, ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import ReferenceCard from '../components/ReferenceCard';
import { useDebounce } from '../hooks/useDebounce';

const typeOptions = [
  { value: '', label: 'جميع الأنواع' },
  { value: 'book', label: 'كتب' },
  { value: 'article', label: 'مقالات' },
  { value: 'thesis', label: 'رسائل' },
  { value: 'chapter', label: 'فصول' },
  { value: 'conference', label: 'مؤتمرات' },
  { value: 'report', label: 'تقارير' },
  { value: 'webpage', label: 'مواقع' },
];

const statusOptions = [
  { value: '', label: 'جميع الحالات' },
  { value: 'unread', label: 'لم يُقرأ' },
  { value: 'reading', label: 'قيد القراءة' },
  { value: 'read', label: 'مقروء' },
  { value: 'skimmed', label: 'مُتصفَّح' },
];

const sortOptions = [
  { value: 'updated_at', label: 'تاريخ التعديل' },
  { value: 'created_at', label: 'تاريخ الإضافة' },
  { value: 'title', label: 'العنوان' },
  { value: 'year', label: 'سنة النشر' },
  { value: 'authors', label: 'المؤلف' },
];

export default function Library() {
  const { viewMode, setViewMode, sortBy, setSortBy, sortOrder, setSortOrder } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: references, isLoading } = useQuery({
    queryKey: ['references', {
      type: typeFilter || undefined,
      read_status: statusFilter || undefined,
      is_favorite: showFavorites || undefined,
      is_archived: showArchived,
      sort_by: sortBy,
      sort_order: sortOrder,
    }],
    queryFn: () => api.getReferences({
      type: typeFilter || undefined,
      read_status: statusFilter || undefined,
      is_favorite: showFavorites || undefined,
      is_archived: showArchived,
      sort_by: sortBy,
      sort_order: sortOrder,
      limit: 100,
    }),
  });

  // Filter by search query locally
  const filteredReferences = references?.filter((ref) => {
    if (!debouncedSearch) return true;
    const search = debouncedSearch.toLowerCase();
    return (
      ref.title?.toLowerCase().includes(search) ||
      ref.title_ar?.toLowerCase().includes(search) ||
      ref.authors?.toLowerCase().includes(search) ||
      ref.authors_ar?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المكتبة</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {references?.length || 0} مرجع
          </p>
        </div>
        <Link to="/references/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          مرجع جديد
        </Link>
      </div>

      {/* Search & Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث في المراجع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pr-10 w-full"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`btn ${showFavorites ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Star className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
              المفضلة
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              فلاتر
            </button>

            {/* View Mode */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="card p-4 grid sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                النوع
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                حالة القراءة
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الترتيب
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الاتجاه
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="input"
              >
                <option value="desc">تنازلي</option>
                <option value="asc">تصاعدي</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* References Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : filteredReferences?.length === 0 ? (
        <div className="card p-12 text-center">
          <Book className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد مراجع
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            ابدأ بإضافة مراجعك البحثية
          </p>
          <Link to="/references/new" className="btn-primary inline-flex">
            <Plus className="h-4 w-4" />
            إضافة مرجع
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredReferences?.map((ref) => (
            <ReferenceCard key={ref.id} reference={ref} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredReferences?.map((ref) => (
            <ReferenceCard key={ref.id} reference={ref} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
}
