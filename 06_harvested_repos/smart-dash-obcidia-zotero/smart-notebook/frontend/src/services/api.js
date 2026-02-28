/**
 * Obsidia API Service
 * خدمة الاتصال بالـ Backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with defaults
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'حدث خطأ غير متوقع';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export const api = {
  // ===== Notes =====
  getNotes: async (params = {}) => {
    const { data } = await client.get('/notes', { params });
    return data;
  },

  getNote: async (noteId) => {
    const { data } = await client.get(`/notes/${noteId}`);
    return data;
  },

  createNote: async (note) => {
    const { data } = await client.post('/notes', note);
    return data;
  },

  updateNote: async (noteId, note) => {
    const { data } = await client.put(`/notes/${noteId}`, note);
    return data;
  },

  deleteNote: async (noteId) => {
    const { data } = await client.delete(`/notes/${noteId}`);
    return data;
  },

  getNoteLinks: async (noteId) => {
    const { data } = await client.get(`/notes/${noteId}/links`);
    return data;
  },

  getNoteBacklinks: async (noteId) => {
    const { data } = await client.get(`/notes/${noteId}/backlinks`);
    return data;
  },

  markNoteReviewed: async (noteId) => {
    const { data } = await client.post(`/notes/${noteId}/review`);
    return data;
  },

  getDueReviews: async () => {
    const { data } = await client.get('/notes/reviews/due');
    return data;
  },

  getOrphanNotes: async () => {
    const { data } = await client.get('/notes/orphans/');
    return data;
  },

  // ===== Tags =====
  getTags: async (params = {}) => {
    const { data } = await client.get('/tags', { params });
    return data;
  },

  createTag: async (tag) => {
    const { data } = await client.post('/tags', tag);
    return data;
  },

  getFrequentConcepts: async (days = 30) => {
    const { data } = await client.get('/tags/stats/frequent', { params: { days } });
    return data;
  },

  // ===== Projects =====
  getProjects: async (params = {}) => {
    const { data } = await client.get('/projects', { params });
    return data;
  },

  getProject: async (projectId) => {
    const { data } = await client.get(`/projects/${projectId}`);
    return data;
  },

  createProject: async (project) => {
    const { data } = await client.post('/projects', project);
    return data;
  },

  updateProject: async (projectId, project) => {
    const { data } = await client.put(`/projects/${projectId}`, project);
    return data;
  },

  deleteProject: async (projectId) => {
    const { data } = await client.delete(`/projects/${projectId}`);
    return data;
  },

  getProjectJourney: async (projectId) => {
    const { data } = await client.get(`/projects/${projectId}/journey`);
    return data;
  },

  // ===== Questions =====
  getProjectQuestions: async (projectId, params = {}) => {
    const { data } = await client.get(`/projects/${projectId}/questions`, { params });
    return data;
  },

  createQuestion: async (projectId, question) => {
    const { data } = await client.post(`/projects/${projectId}/questions`, question);
    return data;
  },

  updateQuestion: async (questionId, question) => {
    const { data } = await client.put(`/projects/questions/${questionId}`, question);
    return data;
  },

  branchQuestion: async (questionId, subQuestion) => {
    const { data } = await client.post(`/projects/questions/${questionId}/branch`, subQuestion);
    return data;
  },

  // ===== Decisions & Milestones =====
  getProjectDecisions: async (projectId) => {
    const { data } = await client.get(`/projects/${projectId}/decisions`);
    return data;
  },

  createDecision: async (projectId, decision) => {
    const { data } = await client.post(`/projects/${projectId}/decisions`, decision);
    return data;
  },

  getProjectMilestones: async (projectId) => {
    const { data } = await client.get(`/projects/${projectId}/milestones`);
    return data;
  },

  createMilestone: async (projectId, milestone) => {
    const { data } = await client.post(`/projects/${projectId}/milestones`, milestone);
    return data;
  },

  // ===== Search =====
  search: async (query) => {
    const { data } = await client.post('/search', query);
    return data;
  },

  getSearchSuggestions: async (q) => {
    const { data } = await client.get('/search/suggestions', { params: { q } });
    return data;
  },

  getSearchStats: async () => {
    const { data } = await client.get('/search/stats');
    return data;
  },

  // ===== Sync =====
  getSyncStatus: async () => {
    const { data } = await client.get('/sync/status');
    return data;
  },

  backupLocal: async () => {
    const { data } = await client.post('/sync/backup/local');
    return data;
  },

  backupBigQuery: async () => {
    const { data } = await client.post('/sync/backup/bigquery');
    return data;
  },

  exportToJson: async () => {
    const { data } = await client.post('/sync/export/json');
    return data;
  },

  getSyncHistory: async () => {
    const { data } = await client.get('/sync/history');
    return data;
  },

  // ===== Integration (with Iqra) =====
  getIntegrationStatus: async () => {
    const { data } = await client.get('/integration/status');
    return data;
  },

  addNoteFromIqra: async (note) => {
    const { data } = await client.post('/integration/from-iqra/note', note);
    return data;
  },

  addQuotationFromIqra: async (quotation) => {
    const { data } = await client.post('/integration/from-iqra/quotation', quotation);
    return data;
  },

  searchInIqra: async (query) => {
    const { data } = await client.post('/integration/to-iqra/search', query);
    return data;
  },

  requestIqraAnalysis: async (content, analysisType) => {
    const { data } = await client.post('/integration/to-iqra/analyze', {
      content,
      analysis_type: analysisType,
    });
    return data;
  },

  // ===== Cognitive =====
  getTodayProfile: async () => {
    const { data } = await client.get('/cognitive/mirror/today');
    return data;
  },

  getCognitiveHistory: async (days = 30) => {
    const { data } = await client.get('/cognitive/mirror/history', { params: { days } });
    return data;
  },

  getMomentum: async () => {
    const { data } = await client.get('/cognitive/momentum');
    return data;
  },

  getWeeklyReport: async () => {
    const { data } = await client.get('/cognitive/reports/weekly');
    return data;
  },

  getCognitivePatterns: async () => {
    const { data } = await client.get('/cognitive/patterns');
    return data;
  },

  // ===== Reminders =====
  getDueReminders: async () => {
    const { data } = await client.get('/cognitive/reminders/due');
    return data;
  },

  getUpcomingReminders: async (days = 7) => {
    const { data } = await client.get('/cognitive/reminders/upcoming', { params: { days } });
    return data;
  },

  createReminder: async (reminder) => {
    const { data } = await client.post('/cognitive/reminders', reminder);
    return data;
  },

  completeReminder: async (reminderId) => {
    const { data } = await client.post(`/cognitive/reminders/${reminderId}/complete`);
    return data;
  },

  // ===== Combined Stats =====
  getStats: async () => {
    try {
      const [searchStats, momentum] = await Promise.all([
        api.getSearchStats(),
        api.getMomentum(),
      ]);

      return {
        total_notes: searchStats.total_notes,
        total_tags: searchStats.total_tags,
        total_projects: searchStats.total_projects,
        total_links: searchStats.total_links,
        open_questions: momentum.open_questions,
      };
    } catch (error) {
      return {
        total_notes: 0,
        total_tags: 0,
        total_projects: 0,
        total_links: 0,
        open_questions: 0,
      };
    }
  },
};

export default api;
