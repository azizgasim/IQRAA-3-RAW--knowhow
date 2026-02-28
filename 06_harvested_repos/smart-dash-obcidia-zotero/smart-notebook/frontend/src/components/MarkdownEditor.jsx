/**
 * MarkdownEditor - محرر Markdown متقدم
 */

import React, { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading2,
  Eye,
  Edit2,
} from 'lucide-react';

export default function MarkdownEditor({ value, onChange, placeholder }) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  const insertMarkdown = useCallback(
    (before, after = '', newLine = false) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      const prefix = newLine && start > 0 && value[start - 1] !== '\n' ? '\n' : '';
      const newText =
        value.substring(0, start) +
        prefix +
        before +
        selectedText +
        after +
        value.substring(end);

      onChange(newText);

      // Restore focus and selection
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + prefix.length + before.length;
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos + selectedText.length;
      }, 0);
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e) => {
      // Tab for indentation
      if (e.key === 'Tab') {
        e.preventDefault();
        insertMarkdown('  ');
      }

      // Ctrl+B for bold
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        insertMarkdown('**', '**');
      }

      // Ctrl+I for italic
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        insertMarkdown('*', '*');
      }

      // Ctrl+K for link
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        insertMarkdown('[[', ']]');
      }
    },
    [insertMarkdown]
  );

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), title: 'عريض (Ctrl+B)' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), title: 'مائل (Ctrl+I)' },
    { icon: Heading2, action: () => insertMarkdown('## ', '', true), title: 'عنوان' },
    { type: 'divider' },
    { icon: Link2, action: () => insertMarkdown('[[', ']]'), title: 'رابط ملاحظة (Ctrl+K)' },
    { icon: Code, action: () => insertMarkdown('`', '`'), title: 'كود' },
    { icon: Quote, action: () => insertMarkdown('> ', '', true), title: 'اقتباس' },
    { type: 'divider' },
    { icon: List, action: () => insertMarkdown('- ', '', true), title: 'قائمة' },
    { icon: ListOrdered, action: () => insertMarkdown('1. ', '', true), title: 'قائمة مرقمة' },
  ];

  // Custom components for wiki links
  const components = {
    a: ({ href, children }) => {
      // Check if it's a wiki link pattern
      if (href && href.startsWith('wiki:')) {
        return (
          <span className="wiki-link">{children}</span>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
          {children}
        </a>
      );
    },
  };

  // Process wiki links in content for preview
  const processedContent = value?.replace(/\[\[([^\]]+)\]\]/g, '[[$1]](wiki:$1)') || '';

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-0.5">
          {toolbarButtons.map((btn, i) =>
            btn.type === 'divider' ? (
              <div key={i} className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-2" />
            ) : (
              <button
                key={i}
                type="button"
                onClick={btn.action}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                title={btn.title}
              >
                <btn.icon className="h-4 w-4" />
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            showPreview
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {showPreview ? (
            <>
              <Edit2 className="h-4 w-4" />
              تحرير
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              معاينة
            </>
          )}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div className="p-6 min-h-[350px] prose prose-sm dark:prose-invert max-w-none overflow-auto">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
              {processedContent}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic">لا يوجد محتوى للمعاينة</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-[350px] p-6 bg-transparent resize-none focus:outline-none font-mono text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
          dir="auto"
        />
      )}

      {/* Footer hints */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 flex items-center gap-4">
        <span>[[نص]] لربط ملاحظة</span>
        <span>**نص** للعريض</span>
        <span>*نص* للمائل</span>
        <span>Ctrl+S للحفظ</span>
      </div>
    </div>
  );
}
