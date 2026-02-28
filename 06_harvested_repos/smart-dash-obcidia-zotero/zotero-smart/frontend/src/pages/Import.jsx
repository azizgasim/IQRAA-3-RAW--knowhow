/**
 * Import - استيراد المراجع
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload, FileText, File, CheckCircle, XCircle,
  AlertTriangle, Download, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function Import() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importFormat, setImportFormat] = useState('auto');

  const importMutation = useMutation({
    mutationFn: ({ file, format }) => api.importReferences(file, format),
    onSuccess: (data) => {
      setImportResult(data);
      queryClient.invalidateQueries(['references']);
      queryClient.invalidateQueries(['stats']);
    },
    onError: (error) => {
      setImportResult({
        success: false,
        error: error.message || 'حدث خطأ أثناء الاستيراد',
      });
    },
  });

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file) => {
    const validExtensions = ['.bib', '.ris', '.json', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setImportResult({
        success: false,
        error: 'صيغة الملف غير مدعومة. الصيغ المدعومة: BibTeX (.bib), RIS (.ris), JSON (.json)',
      });
      return;
    }

    setSelectedFile(file);
    setImportResult(null);

    // Auto-detect format
    if (importFormat === 'auto') {
      if (ext === '.bib') setImportFormat('bibtex');
      else if (ext === '.ris') setImportFormat('ris');
      else if (ext === '.json') setImportFormat('json');
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;

    const format = importFormat === 'auto' ? detectFormat(selectedFile.name) : importFormat;
    importMutation.mutate({ file: selectedFile, format });
  };

  const detectFormat = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'bib') return 'bibtex';
    if (ext === 'ris') return 'ris';
    if (ext === 'json') return 'json';
    return 'bibtex';
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    setImportFormat('auto');
  };

  const formatIcons = {
    bibtex: '📚',
    ris: '📄',
    json: '{}',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">استيراد المراجع</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          استورد مراجعك من Zotero أو Mendeley أو أي مدير مراجع آخر
        </p>
      </div>

      {/* Supported Formats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { id: 'bibtex', name: 'BibTeX', ext: '.bib', desc: 'صيغة LaTeX الشائعة' },
          { id: 'ris', name: 'RIS', ext: '.ris', desc: 'صيغة EndNote و Zotero' },
          { id: 'json', name: 'JSON', ext: '.json', desc: 'صيغة البيانات المنظمة' },
        ].map((format) => (
          <div
            key={format.id}
            className={`card p-4 cursor-pointer transition-all ${
              importFormat === format.id
                ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'hover:shadow-md'
            }`}
            onClick={() => setImportFormat(format.id)}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{formatIcons[format.id]}</span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{format.name}</h3>
                <p className="text-xs text-gray-500">{format.ext} - {format.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} كيلوبايت
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleImport}
                disabled={importMutation.isLoading}
                className="btn btn-primary"
              >
                {importMutation.isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    جاري الاستيراد...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    استيراد الملف
                  </>
                )}
              </button>
              <button onClick={resetImport} className="btn btn-secondary">
                تغيير الملف
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                اسحب الملف هنا أو انقر للاختيار
              </p>
              <p className="text-sm text-gray-500 mt-1">
                يدعم ملفات BibTeX (.bib) و RIS (.ris) و JSON (.json)
              </p>
            </div>
            <label className="btn btn-primary cursor-pointer inline-flex">
              <File className="h-4 w-4" />
              اختر ملف
              <input
                type="file"
                accept=".bib,.ris,.json,.txt"
                onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Import Result */}
      {importResult && (
        <div
          className={`card p-6 ${
            importResult.success
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-start gap-4">
            {importResult.success ? (
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className={`font-medium ${
                importResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {importResult.success ? 'تم الاستيراد بنجاح!' : 'فشل الاستيراد'}
              </h3>

              {importResult.success ? (
                <div className="mt-2 space-y-2">
                  <p className="text-green-700 dark:text-green-300">
                    تم استيراد {importResult.imported_count} مرجع بنجاح
                  </p>

                  {importResult.skipped_count > 0 && (
                    <p className="text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      تم تخطي {importResult.skipped_count} مرجع (مكرر أو غير صالح)
                    </p>
                  )}

                  {importResult.errors?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        تفاصيل الأخطاء:
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                        {importResult.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li>و {importResult.errors.length - 5} أخطاء أخرى...</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => navigate('/library')}
                      className="btn btn-primary"
                    >
                      عرض المكتبة
                    </button>
                    <button onClick={resetImport} className="btn btn-secondary">
                      استيراد المزيد
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-red-700 dark:text-red-300">
                    {importResult.error}
                  </p>
                  <button onClick={resetImport} className="btn btn-secondary mt-4">
                    حاول مجدداً
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card p-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          كيفية تصدير مراجعك من مديري المراجع الآخرين
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <span className="text-xl">📚</span> Zotero
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
              <li>حدد المجموعة أو المراجع المطلوبة</li>
              <li>اذهب إلى ملف → تصدير المكتبة</li>
              <li>اختر صيغة BibTeX أو RIS</li>
              <li>احفظ الملف واستورده هنا</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <span className="text-xl">📖</span> Mendeley
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
              <li>حدد المراجع في المكتبة</li>
              <li>اذهب إلى ملف → تصدير</li>
              <li>اختر صيغة BibTeX</li>
              <li>احفظ الملف واستورده هنا</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <span className="text-xl">🔬</span> EndNote
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
              <li>حدد المراجع المطلوبة</li>
              <li>اذهب إلى ملف → تصدير</li>
              <li>اختر صيغة RIS</li>
              <li>احفظ الملف واستورده هنا</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <span className="text-xl">📝</span> Google Scholar
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
              <li>انقر على "اقتباس" أسفل المرجع</li>
              <li>اختر BibTeX</li>
              <li>انسخ النص إلى ملف .bib</li>
              <li>استورد الملف هنا</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="card p-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          تصدير مراجعك
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          يمكنك أيضاً تصدير مراجعك لاستخدامها في أدوات أخرى
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => api.exportReferences('bibtex').then(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'references.bib';
              a.click();
            })}
            className="btn btn-secondary"
          >
            <Download className="h-4 w-4" />
            تصدير BibTeX
          </button>
          <button
            onClick={() => api.exportReferences('ris').then(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'references.ris';
              a.click();
            })}
            className="btn btn-secondary"
          >
            <Download className="h-4 w-4" />
            تصدير RIS
          </button>
          <button
            onClick={() => api.exportReferences('json').then(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'references.json';
              a.click();
            })}
            className="btn btn-secondary"
          >
            <Download className="h-4 w-4" />
            تصدير JSON
          </button>
        </div>
      </div>
    </div>
  );
}
