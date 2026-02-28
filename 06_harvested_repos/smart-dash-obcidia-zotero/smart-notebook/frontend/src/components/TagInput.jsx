/**
 * TagInput - إدخال الوسوم
 */

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Tag } from 'lucide-react';
import { api } from '../services/api';

export default function TagInput({ tags = [], onChange, placeholder = 'أضف وسماً...' }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch existing tags for suggestions
  const { data: existingTags } = useQuery({
    queryKey: ['tags'],
    queryFn: api.getTags,
  });

  // Filter suggestions
  const suggestions = existingTags
    ?.filter(
      (t) =>
        t.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(t.name)
    )
    .slice(0, 5) || [];

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tagName) => {
    const trimmed = tagName.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="flex flex-wrap items-center gap-2">
        {/* Existing tags */}
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-sm"
          >
            <Tag className="h-3 w-3" />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (inputValue || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
          {suggestions.length > 0 ? (
            suggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => addTag(tag.name)}
                className="w-full flex items-center gap-2 px-3 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-gray-900 dark:text-white">#{tag.name}</span>
                <span className="text-gray-400 text-xs mr-auto">
                  {tag.usage_count} استخدام
                </span>
              </button>
            ))
          ) : inputValue ? (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              className="w-full flex items-center gap-2 px-3 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-primary-600">إنشاء وسم جديد:</span>
              <span className="text-gray-900 dark:text-white">#{inputValue}</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
