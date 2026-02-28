/**
 * Collections - المجموعات
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Folder, FolderOpen, Edit2, Trash2, ChevronDown, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function Collections() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => api.getCollections(false),
  });

  const createMutation = useMutation({
    mutationFn: api.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries(['collections']);
      toast.success('تم إنشاء المجموعة');
      setShowModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateCollection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['collections']);
      toast.success('تم تحديث المجموعة');
      setEditingCollection(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries(['collections']);
      toast.success('تم حذف المجموعة');
    },
  });

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المجموعات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">تنظيم مراجعك في مجموعات</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          مجموعة جديدة
        </button>
      </div>

      {/* Collections Tree */}
      {collections?.length === 0 ? (
        <div className="card p-12 text-center">
          <Folder className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد مجموعات
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            أنشئ مجموعات لتنظيم مراجعك
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            إنشاء مجموعة
          </button>
        </div>
      ) : (
        <div className="card divide-y divide-gray-200 dark:divide-gray-700">
          {collections?.map((collection) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              level={0}
              expandedIds={expandedIds}
              onToggle={toggleExpand}
              onEdit={setEditingCollection}
              onDelete={(id) => {
                if (confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
                  deleteMutation.mutate(id);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showModal || editingCollection) && (
        <CollectionModal
          collection={editingCollection}
          collections={collections}
          onClose={() => {
            setShowModal(false);
            setEditingCollection(null);
          }}
          onSave={(data) => {
            if (editingCollection) {
              updateMutation.mutate({ id: editingCollection.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function CollectionItem({ collection, level, expandedIds, onToggle, onEdit, onDelete }) {
  const hasChildren = collection.children?.length > 0;
  const isExpanded = expandedIds.has(collection.id);

  return (
    <div>
      <div
        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
        style={{ paddingRight: `${1 + level * 1.5}rem` }}
      >
        {hasChildren ? (
          <button
            onClick={() => onToggle(collection.id)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: collection.color + '20' }}
        >
          {isExpanded ? (
            <FolderOpen className="h-4 w-4" style={{ color: collection.color }} />
          ) : (
            <Folder className="h-4 w-4" style={{ color: collection.color }} />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {collection.name_ar || collection.name}
          </h3>
          {collection.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{collection.description}</p>
          )}
        </div>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          {collection.references_count || 0} مرجع
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(collection)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(collection.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {collection.children.map((child) => (
            <CollectionItem
              key={child.id}
              collection={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionModal({ collection, collections, onClose, onSave, isLoading }) {
  const [name, setName] = useState(collection?.name || '');
  const [nameAr, setNameAr] = useState(collection?.name_ar || '');
  const [description, setDescription] = useState(collection?.description || '');
  const [parentId, setParentId] = useState(collection?.parent_id || '');
  const [color, setColor] = useState(collection?.color || '#10b981');

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('اسم المجموعة مطلوب');
      return;
    }
    onSave({
      name: name.trim(),
      name_ar: nameAr.trim() || null,
      description: description.trim() || null,
      parent_id: parentId ? parseInt(parentId) : null,
      color,
    });
  };

  // Flatten collections for parent selection
  const flattenCollections = (colls, level = 0) => {
    let result = [];
    for (const c of colls || []) {
      if (c.id !== collection?.id) {
        result.push({ ...c, level });
        if (c.children) {
          result = result.concat(flattenCollections(c.children, level + 1));
        }
      }
    }
    return result;
  };

  const flatCollections = flattenCollections(collections);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {collection ? 'تعديل المجموعة' : 'مجموعة جديدة'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              اسم المجموعة *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="مثال: فقه"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الاسم بالعربية
            </label>
            <input
              type="text"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الوصف
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              المجموعة الأم
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="input"
            >
              <option value="">بدون (مستوى رئيسي)</option>
              {flatCollections.map((c) => (
                <option key={c.id} value={c.id}>
                  {'—'.repeat(c.level)} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اللون
            </label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? 'جاري الحفظ...' : collection ? 'تحديث' : 'إنشاء'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
