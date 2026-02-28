/**
 * Search - البحث المتقدم
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search as SearchIcon, FileText, HelpCircle, Quote,
  Filter, X, Clock, Tag, Folder
} from 'lucide-react';
import { api } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [projectFilter, setProjectFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch tags for filter
  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: api.getTags,
  });

  // Fetch projects for filter
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });

  // Search results
  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery, searchType, selectedTags, projectFilter],
    queryFn: () =>
      api.search({
        query: debouncedQuery,
        type: searchType === 'all' ? undefined : searchType,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        project_id: projectFilter || undefined,
      }),
    enabled: debouncedQuery.length >= 2,
  });

  // Update URL when query changes
  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery });
    } else {
      setSearchParams({});
    }
  }, [debouncedQuery, setSearchParams]);

  const handleTagToggle = (tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setProjectFilter('');
    setSearchType('all');
  };

  const hasFilters = selectedTags.length > 0 || projectFilter || searchType !== 'all';

  const typeConfig = {
    notes: { icon: FileText, label: 'ملاحظات', color: 'text-blue-600' },
    questions: { icon: HelpCircle, label: 'أسئلة', color: 'text-purple-600' },
    quotations: { icon: Quote, label: 'اقتباسات', color: 'text-green-600' },
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">البحث</h1>

        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الملاحظات، الأسئلة، والاقتباسات..."
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

      {/* Filter Toggle & Type Selector */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Type Selector */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setSearchType('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              searchType === 'all'
                ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            الكل
          </button>
          {Object.entries(typeConfig).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                searchType === type
                  ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <config.icon className="h-4 w-4" />
              {config.label}
            </button>
          ))}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            hasFilters
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Filter className="h-4 w-4" />
          فلاتر
          {hasFilters && (
            <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {(selectedTags.length > 0 ? 1 : 0) + (projectFilter ? 1 : 0) + (searchType !== 'all' ? 1 : 0)}
            </span>
          )}
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="card p-4 space-y-4">
          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Folder className="h-4 w-4 inline ml-1" />
              المشروع
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="input w-full max-w-xs"
            >
              <option value="">جميع المشاريع</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="h-4 w-4 inline ml-1" />
              الوسوم
            </label>
            <div className="flex flex-wrap gap-2">
              {tags?.slice(0, 20).map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => handleTagToggle(tag.name)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag.name)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag.name}
                  <span className="mr-1 opacity-60">({tag.notes_count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      <div>
        {!debouncedQuery ? (
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              ابدأ البحث
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              اكتب كلمة أو عبارة للبحث في محتواك
            </p>
          </div>
        ) : debouncedQuery.length < 2 ? (
          <div className="text-center py-8 text-gray-500">
            اكتب حرفين على الأقل للبحث
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner" />
          </div>
        ) : !results?.length ? (
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
          <div className="space-y-4">
            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                {results.length} نتيجة {isFetching && '(جاري التحديث...)'}
              </span>
            </div>

            {/* Results List */}
            <div className="space-y-3">
              {results.map((result, index) => (
                <SearchResultCard
                  key={`${result.type}-${result.id}-${index}`}
                  result={result}
                  query={debouncedQuery}
                  navigate={navigate}
                  typeConfig={typeConfig}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultCard({ result, query, navigate, typeConfig }) {
  const config = typeConfig[result.type] || typeConfig.notes;
  const Icon = config.icon;

  const handleClick = () => {
    if (result.type === 'notes') {
      navigate(`/notes/${result.id}`);
    } else if (result.type === 'questions' && result.project_id) {
      navigate(`/projects/${result.project_id}?tab=questions`);
    }
  };

  // Highlight matching text
  const highlightText = (text, maxLength = 200) => {
    if (!text) return '';

    const truncated = text.length > maxLength
      ? text.slice(0, maxLength) + '...'
      : text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = truncated.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900 text-inherit rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      onClick={handleClick}
      className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${config.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            {result.project_name && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                • {result.project_name}
              </span>
            )}
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            {highlightText(result.title || result.question || result.text, 100)}
          </h4>
          {result.content && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {highlightText(result.content)}
            </p>
          )}
          {result.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {result.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {result.updated_at && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(result.updated_at), { locale: ar, addSuffix: true })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
