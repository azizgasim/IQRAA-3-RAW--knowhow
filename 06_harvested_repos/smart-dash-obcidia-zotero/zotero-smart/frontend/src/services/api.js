/**
 * Zotero Smart - API Service
 */

import axios from 'axios';

const API_BASE_URL = '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // === References ===
  getReferences: async (params = {}) => {
    const { data } = await axiosInstance.get('/references', { params });
    return data;
  },

  getReference: async (id) => {
    const { data } = await axiosInstance.get(`/references/${id}`);
    return data;
  },

  createReference: async (reference) => {
    const { data } = await axiosInstance.post('/references', reference);
    return data;
  },

  updateReference: async (id, reference) => {
    const { data } = await axiosInstance.put(`/references/${id}`, reference);
    return data;
  },

  deleteReference: async (id) => {
    const { data } = await axiosInstance.delete(`/references/${id}`);
    return data;
  },

  toggleFavorite: async (id) => {
    const { data } = await axiosInstance.post(`/references/${id}/favorite`);
    return data;
  },

  toggleArchive: async (id) => {
    const { data } = await axiosInstance.post(`/references/${id}/archive`);
    return data;
  },

  updateReadStatus: async (id, status) => {
    const { data } = await axiosInstance.put(`/references/${id}/read-status?status=${status}`);
    return data;
  },

  updateRating: async (id, rating) => {
    const { data } = await axiosInstance.put(`/references/${id}/rating?rating=${rating}`);
    return data;
  },

  // === Collections ===
  getCollections: async (flat = false) => {
    const { data } = await axiosInstance.get('/collections', { params: { flat } });
    return data;
  },

  getCollection: async (id) => {
    const { data } = await axiosInstance.get(`/collections/${id}`);
    return data;
  },

  createCollection: async (collection) => {
    const { data } = await axiosInstance.post('/collections', collection);
    return data;
  },

  updateCollection: async (id, collection) => {
    const { data } = await axiosInstance.put(`/collections/${id}`, collection);
    return data;
  },

  deleteCollection: async (id) => {
    const { data } = await axiosInstance.delete(`/collections/${id}`);
    return data;
  },

  addToCollection: async (collectionId, referenceId) => {
    const { data } = await axiosInstance.post(`/collections/${collectionId}/references/${referenceId}`);
    return data;
  },

  removeFromCollection: async (collectionId, referenceId) => {
    const { data } = await axiosInstance.delete(`/collections/${collectionId}/references/${referenceId}`);
    return data;
  },

  // === Tags ===
  getTags: async () => {
    const { data } = await axiosInstance.get('/tags');
    return data;
  },

  createTag: async (tag) => {
    const { data } = await axiosInstance.post('/tags', tag);
    return data;
  },

  deleteTag: async (id) => {
    const { data } = await axiosInstance.delete(`/tags/${id}`);
    return data;
  },

  // === Annotations ===
  getAnnotations: async (referenceId) => {
    const { data } = await axiosInstance.get(`/references/${referenceId}/annotations`);
    return data;
  },

  createAnnotation: async (annotation) => {
    const { data } = await axiosInstance.post('/annotations', annotation);
    return data;
  },

  updateAnnotation: async (id, annotation) => {
    const { data } = await axiosInstance.put(`/annotations/${id}`, annotation);
    return data;
  },

  deleteAnnotation: async (id) => {
    const { data } = await axiosInstance.delete(`/annotations/${id}`);
    return data;
  },

  // === Notes ===
  getNotes: async (referenceId) => {
    const { data } = await axiosInstance.get(`/references/${referenceId}/notes`);
    return data;
  },

  createNote: async (note) => {
    const { data } = await axiosInstance.post('/notes', note);
    return data;
  },

  updateNote: async (id, note) => {
    const { data } = await axiosInstance.put(`/notes/${id}`, note);
    return data;
  },

  deleteNote: async (id) => {
    const { data } = await axiosInstance.delete(`/notes/${id}`);
    return data;
  },

  // === Search ===
  search: async (query, params = {}) => {
    const { data } = await axiosInstance.get('/search', { params: { q: query, ...params } });
    return data;
  },

  getSuggestions: async (query) => {
    const { data } = await axiosInstance.get('/search/suggestions', { params: { q: query } });
    return data;
  },

  // === Citations ===
  formatCitation: async (referenceId, style) => {
    const { data } = await axiosInstance.post('/citations/format', { reference_id: referenceId, style });
    return data;
  },

  getAllCitationFormats: async (referenceId) => {
    const { data } = await axiosInstance.get(`/citations/reference/${referenceId}`);
    return data;
  },

  getAvailableFormats: async () => {
    const { data } = await axiosInstance.get('/citations/formats');
    return data;
  },

  // === Statistics ===
  getLibraryStats: async () => {
    const { data } = await axiosInstance.get('/stats/library');
    return data;
  },

  getReadingStats: async () => {
    const { data } = await axiosInstance.get('/stats/reading');
    return data;
  },

  getTopAuthors: async (limit = 10) => {
    const { data } = await axiosInstance.get('/stats/authors/top', { params: { limit } });
    return data;
  },

  getTopTags: async (limit = 10) => {
    const { data } = await axiosInstance.get('/stats/tags/top', { params: { limit } });
    return data;
  },

  getActivityTimeline: async (days = 30) => {
    const { data } = await axiosInstance.get('/stats/activity', { params: { days } });
    return data;
  },

  // === Import/Export ===
  importBibtex: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await axiosInstance.post('/io/import/bibtex', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  importRis: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await axiosInstance.post('/io/import/ris', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  importJson: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await axiosInstance.post('/io/import/json', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  exportBibtex: async (referenceIds) => {
    const { data } = await axiosInstance.post('/io/export/bibtex', { reference_ids: referenceIds, format: 'bibtex' });
    return data;
  },

  exportJson: async (referenceIds) => {
    const { data } = await axiosInstance.post('/io/export/json', { reference_ids: referenceIds, format: 'json' });
    return data;
  },

  getImportHistory: async () => {
    const { data } = await axiosInstance.get('/io/import/history');
    return data;
  },

  // === Integration ===
  sendToNotebook: async (referenceId, options = {}) => {
    const { data } = await axiosInstance.post('/integration/send-to-notebook', {
      reference_id: referenceId,
      include_annotations: options.includeAnnotations ?? true,
      include_notes: options.includeNotes ?? true,
    });
    return data;
  },

  sendToGraph: async (referenceIds, includeRelations = true) => {
    const { data } = await axiosInstance.post('/integration/send-to-graph', {
      reference_ids: referenceIds,
      include_relations: includeRelations,
    });
    return data;
  },
};
