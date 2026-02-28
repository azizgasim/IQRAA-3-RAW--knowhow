/**
 * Search - البحث المتقدم
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, Filter, Book, X, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import { useDebounce } from '../hooks/useDebounce';

export default function Search() {
  const navigate = useNavigate();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useStore();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    year_from: '',
    year_to: '',
    language: '',
  });

  const debouncedQuery = useDebounce(query, 300);

  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery, filters],
    queryFn: () => api.search(debouncedQuery, {
      type: filters.type || undefined,
      year_from: filters.year_from || undefined,
      year_to: filters.year_to || undefined,
      language: filters.language || undefined,
    }),
    enabled: debouncedQuery.length >= 2,
    onSuccess: () => {
      if (debouncedQuery.length >= 2) {
        addRecentSearch(debouncedQuery);
      }
    },
  });

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions', debouncedQuery],
    queryFn: () => api.getSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 1 && debouncedQuery.length < 3,
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">البحث</h1>

        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في المراجع بالعنوان أو المؤلف..."
            className="input pr-12 pl-4 py-3 w-full text-lg"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Filter className="h-4 w-4" />
          فلاتر متقدمة
        </button>

        {(filters.type || filters.year_from || filters.year_to || filters.language) && (
          <button
            onClick={() => setFilters({ type: '', year_from: '', year_to: '', language: '' })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="card p-4 grid sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              النوع
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input"
            >
              <option value="">الكل</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              من سنة
            </label>
            <input
              type="number"
              value={filters.year_from}
              onChange={(e) => setFilters({ ...filters, year_from: e.target.value })}
              className="input"
              placeholder="1900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              إلى سنة
            </label>
            <input
              type="number"
              value={filters.year_to}
              onChange={(e) => setFilters({ ...filters, year_to: e.target.value })}
              className="input"
              placeholder="2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              اللغة
            </label>
            <select
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              className="input"
            >
              <option value="">الكل</option>
              <option value="ar">العربية</option>
              <option value="en">الإنجليزية</option>
            </select>
          </div>
        </div>
      )}

      {/* Results / Suggestions / Recent */}
      {!debouncedQuery ? (
        <div className="space-y-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  عمليات البحث الأخيرة
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  مسح
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(search)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              ابدأ البحث
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              اكتب كلمة للبحث في عناوين المراجع والمؤلفين
            </p>
          </div>
        </div>
      ) : debouncedQuery.length < 2 ? (
        // Suggestions
        suggestions?.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">اقتراحات</h3>
            <div className="space-y-1">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s.text)}
                  className="w-full text-right px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-white">{s.text}</span>
                  <span className="text-xs text-gray-400 mr-2">
                    {s.type === 'title' ? 'عنوان' : s.type === 'author' ? 'مؤلف' : 'وسم'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner" />
        </div>
      ) : results?.length === 0 ? (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد نتائج
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            جرب كلمات بحث مختلفة أو قم بتغيير الفلاتر
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {results.length} نتيجة {isFetching && '(جاري التحديث...)'}
          </p>

          {results.map((ref) => (
            <div
              key={ref.id}
              onClick={() => navigate(`/references/${ref.id}`)}
              className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center type-${ref.type}`}>
                  <Book className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded type-${ref.type}`}>
                      {typeLabels[ref.type]}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {ref.title_ar || ref.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {ref.authors} {ref.year && `(${ref.year})`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
