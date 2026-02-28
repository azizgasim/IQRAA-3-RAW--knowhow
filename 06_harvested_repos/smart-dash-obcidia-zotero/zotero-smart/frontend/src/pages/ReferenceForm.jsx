/**
 * ReferenceForm - إضافة/تعديل مرجع
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Save, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const typeOptions = [
  { value: 'book', label: 'كتاب' },
  { value: 'article', label: 'مقالة' },
  { value: 'thesis', label: 'رسالة علمية' },
  { value: 'chapter', label: 'فصل في كتاب' },
  { value: 'conference', label: 'ورقة مؤتمر' },
  { value: 'report', label: 'تقرير' },
  { value: 'webpage', label: 'موقع إلكتروني' },
  { value: 'other', label: 'آخر' },
];

const languageOptions = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'other', label: 'أخرى' },
];

export default function ReferenceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    authors: '',
    authors_ar: '',
    year: '',
    hijri_year: '',
    type: 'book',
    publisher: '',
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    isbn: '',
    url: '',
    abstract: '',
    abstract_ar: '',
    language: 'ar',
    tags: [],
    collection_ids: [],
  });

  const [newTag, setNewTag] = useState('');

  // Fetch existing reference if editing
  const { data: reference, isLoading: refLoading } = useQuery({
    queryKey: ['reference', id],
    queryFn: () => api.getReference(id),
    enabled: isEdit,
  });

  // Fetch collections for selection
  const { data: collections } = useQuery({
    queryKey: ['collections', 'flat'],
    queryFn: () => api.getCollections(true),
  });

  // Populate form when editing
  useEffect(() => {
    if (reference) {
      setFormData({
        title: reference.title || '',
        title_ar: reference.title_ar || '',
        authors: reference.authors || '',
        authors_ar: reference.authors_ar || '',
        year: reference.year?.toString() || '',
        hijri_year: reference.hijri_year || '',
        type: reference.type || 'book',
        publisher: reference.publisher || '',
        journal: reference.journal || '',
        volume: reference.volume || '',
        issue: reference.issue || '',
        pages: reference.pages || '',
        doi: reference.doi || '',
        isbn: reference.isbn || '',
        url: reference.url || '',
        abstract: reference.abstract || '',
        abstract_ar: reference.abstract_ar || '',
        language: reference.language || 'ar',
        tags: reference.tags || [],
        collection_ids: reference.collections?.map(c => c.id) || [],
      });
    }
  }, [reference]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        year: data.year ? parseInt(data.year) : null,
      };
      return isEdit ? api.updateReference(id, payload) : api.createReference(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['references']);
      toast.success(isEdit ? 'تم تحديث المرجع' : 'تم إضافة المرجع');
      navigate(`/references/${data.id}`);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحفظ');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('العنوان مطلوب');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const toggleCollection = (collId) => {
    setFormData((prev) => ({
      ...prev,
      collection_ids: prev.collection_ids.includes(collId)
        ? prev.collection_ids.filter((id) => id !== collId)
        : [...prev.collection_ids, collId],
    }));
  };

  if (isEdit && refLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowRight className="h-5 w-5" />
          رجوع
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'تعديل المرجع' : 'إضافة مرجع جديد'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Type & Language */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              نوع المرجع *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="input"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              اللغة
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="input"
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Titles */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              العنوان بالعربية *
            </label>
            <input
              type="text"
              value={formData.title_ar || formData.title}
              onChange={(e) => handleChange(formData.language === 'ar' ? 'title' : 'title_ar', e.target.value)}
              className="input"
              placeholder="عنوان المرجع..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              العنوان بالإنجليزية
            </label>
            <input
              type="text"
              value={formData.language === 'ar' ? formData.title_ar : formData.title}
              onChange={(e) => handleChange(formData.language === 'ar' ? 'title_ar' : 'title', e.target.value)}
              className="input"
              placeholder="Title in English..."
              dir="ltr"
            />
          </div>
        </div>

        {/* Authors */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              المؤلفون
            </label>
            <input
              type="text"
              value={formData.authors_ar || formData.authors}
              onChange={(e) => handleChange(formData.language === 'ar' ? 'authors' : 'authors_ar', e.target.value)}
              className="input"
              placeholder="المؤلف الأول، المؤلف الثاني..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Authors (English)
            </label>
            <input
              type="text"
              value={formData.language === 'ar' ? formData.authors_ar : formData.authors}
              onChange={(e) => handleChange(formData.language === 'ar' ? 'authors_ar' : 'authors', e.target.value)}
              className="input"
              placeholder="Author 1, Author 2..."
              dir="ltr"
            />
          </div>
        </div>

        {/* Year & Publisher */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              السنة الميلادية
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('year', e.target.value)}
              className="input"
              placeholder="2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              السنة الهجرية
            </label>
            <input
              type="text"
              value={formData.hijri_year}
              onChange={(e) => handleChange('hijri_year', e.target.value)}
              className="input"
              placeholder="1445"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الناشر
            </label>
            <input
              type="text"
              value={formData.publisher}
              onChange={(e) => handleChange('publisher', e.target.value)}
              className="input"
              placeholder="دار النشر..."
            />
          </div>
        </div>

        {/* Journal fields (for articles) */}
        {(formData.type === 'article' || formData.type === 'conference') && (
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                المجلة / المؤتمر
              </label>
              <input
                type="text"
                value={formData.journal}
                onChange={(e) => handleChange('journal', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                المجلد
              </label>
              <input
                type="text"
                value={formData.volume}
                onChange={(e) => handleChange('volume', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                العدد
              </label>
              <input
                type="text"
                value={formData.issue}
                onChange={(e) => handleChange('issue', e.target.value)}
                className="input"
              />
            </div>
          </div>
        )}

        {/* Pages, DOI, ISBN */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الصفحات
            </label>
            <input
              type="text"
              value={formData.pages}
              onChange={(e) => handleChange('pages', e.target.value)}
              className="input"
              placeholder="1-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              DOI
            </label>
            <input
              type="text"
              value={formData.doi}
              onChange={(e) => handleChange('doi', e.target.value)}
              className="input"
              placeholder="10.xxxx/xxxxx"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ISBN
            </label>
            <input
              type="text"
              value={formData.isbn}
              onChange={(e) => handleChange('isbn', e.target.value)}
              className="input"
              dir="ltr"
            />
          </div>
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            الرابط
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => handleChange('url', e.target.value)}
            className="input"
            placeholder="https://..."
            dir="ltr"
          />
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            الملخص
          </label>
          <textarea
            value={formData.abstract_ar || formData.abstract}
            onChange={(e) => handleChange(formData.language === 'ar' ? 'abstract' : 'abstract_ar', e.target.value)}
            rows={4}
            className="input resize-none"
            placeholder="ملخص المرجع..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الوسوم
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="input flex-1"
              placeholder="أضف وسماً..."
            />
            <button type="button" onClick={addTag} className="btn-secondary">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Collections */}
        {collections?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المجموعات
            </label>
            <div className="flex flex-wrap gap-2">
              {collections.map((coll) => (
                <button
                  key={coll.id}
                  type="button"
                  onClick={() => toggleCollection(coll.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    formData.collection_ids.includes(coll.id)
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {coll.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="btn-primary"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'جاري الحفظ...' : isEdit ? 'تحديث' : 'إضافة'}
          </button>
        </div>
      </form>
    </div>
  );
}
