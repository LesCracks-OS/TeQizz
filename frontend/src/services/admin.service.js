import apiClient from './api/apiClient';

const BASE = '/api/v1/admin';

// ─── Platform ──────────────────────────────────────────────────────────────

const getStats = () => apiClient.get(`${BASE}/platform/stats`);

const getUsers = (params = {}) =>
  apiClient.get(`${BASE}/platform/users`, { params });

const updateUserRole = (id, roleName) =>
  apiClient.put(`${BASE}/platform/users/${id}/role`, { roleName });

const deleteUser = (id) =>
  apiClient.delete(`${BASE}/platform/users/${id}`);

// ─── QCM – Categories ──────────────────────────────────────────────────────

const getQcmCategories = () =>
  apiClient.get(`${BASE}/qcm/categories`);

const createQcmCategory = (data) =>
  apiClient.post(`${BASE}/qcm/categories`, data);

const updateQcmCategory = (id, data) =>
  apiClient.put(`${BASE}/qcm/categories/${id}`, data);

const deleteQcmCategory = (id) =>
  apiClient.delete(`${BASE}/qcm/categories/${id}`);

// ─── QCM – Tags ────────────────────────────────────────────────────────────

const getQcmTags = (params = {}) =>
  apiClient.get(`${BASE}/qcm/tags`, { params });

const createQcmTag = (data) =>
  apiClient.post(`${BASE}/qcm/tags`, data);

const updateQcmTag = (id, data) =>
  apiClient.put(`${BASE}/qcm/tags/${id}`, data);

const deleteQcmTag = (id) =>
  apiClient.delete(`${BASE}/qcm/tags/${id}`);

// ─── QCM – Questions ───────────────────────────────────────────────────────

const getQcmQuestions = (params = {}) =>
  apiClient.get(`${BASE}/qcm/questions`, { params });

const getQcmQuestion = (id) =>
  apiClient.get(`${BASE}/qcm/questions/${id}`);

const createQcmQuestion = (data) =>
  apiClient.post(`${BASE}/qcm/questions`, data);

const updateQcmQuestion = (id, data) =>
  apiClient.put(`${BASE}/qcm/questions/${id}`, data);

const updateQcmQuestionStatus = (id, status) =>
  apiClient.put(`${BASE}/qcm/questions/${id}/status`, { status });

const deleteQcmQuestion = (id) =>
  apiClient.delete(`${BASE}/qcm/questions/${id}`);

const getQcmConfig = () =>
  apiClient.get(`${BASE}/qcm/config`);

const importQcmQuestions = (questions) =>
  apiClient.post(`${BASE}/qcm/questions/import`, questions);

// ─── QCM – Contributions ───────────────────────────────────────────────────

const getContributions = () =>
  apiClient.get(`${BASE}/contributions`);

const getContributionsCount = () =>
  apiClient.get(`${BASE}/contributions/count`);

const approveContribution = (id) =>
  apiClient.put(`${BASE}/contributions/${id}/review`, { decision: 'APPROVED' });

const rejectContribution = (id) =>
  apiClient.put(`${BASE}/contributions/${id}/review`, { decision: 'REJECTED' });

// ─── QCM – Sessions ────────────────────────────────────────────────────────

const getQcmSessions = (params = {}) =>
  apiClient.get(`${BASE}/qcm/sessions`, { params });

const forceCompleteQcmSession = (id) =>
  apiClient.put(`${BASE}/qcm/sessions/${id}/complete`);

const deleteQcmSession = (id) =>
  apiClient.delete(`${BASE}/qcm/sessions/${id}`);

// ─── Smatch – Decks ────────────────────────────────────────────────────────

const getSmatchDecks = (params = {}) =>
  apiClient.get(`${BASE}/smatch/decks`, { params });

const getSmatchDeck = (id) =>
  apiClient.get(`${BASE}/smatch/decks/${id}`);

const createSmatchDeck = (data) =>
  apiClient.post(`${BASE}/smatch/decks`, data);

const updateSmatchDeck = (id, data) =>
  apiClient.put(`${BASE}/smatch/decks/${id}`, data);

const updateSmatchDeckStatus = (id, isActive) =>
  apiClient.put(`${BASE}/smatch/decks/${id}/status`, { isActive });

const deleteSmatchDeck = (id) =>
  apiClient.delete(`${BASE}/smatch/decks/${id}`);

// ─── Smatch – Pairs ────────────────────────────────────────────────────────

const getSmatchPairs = (deckId, params = {}) =>
  apiClient.get(`${BASE}/smatch/decks/${deckId}/pairs`, { params });

const createSmatchPair = (deckId, data) =>
  apiClient.post(`${BASE}/smatch/decks/${deckId}/pairs`, data);

const createSmatchPairsBulk = (deckId, pairs) =>
  apiClient.post(`${BASE}/smatch/decks/${deckId}/pairs/bulk`, pairs);

const replaceSmatchPairs = (deckId, pairs) =>
  apiClient.put(`${BASE}/smatch/decks/${deckId}/pairs`, pairs);

const updateSmatchPair = (id, data) =>
  apiClient.put(`${BASE}/smatch/pairs/${id}`, data);

const deleteSmatchPair = (id) =>
  apiClient.delete(`${BASE}/smatch/pairs/${id}`);

// ─── Smatch – Sessions ─────────────────────────────────────────────────────

const getSmatchSessions = (params = {}) =>
  apiClient.get(`${BASE}/smatch/sessions`, { params });

const getSmatchSession = (id) =>
  apiClient.get(`${BASE}/smatch/sessions/${id}`);

const deleteSmatchSession = (id) =>
  apiClient.delete(`${BASE}/smatch/sessions/${id}`);

const getSmatchConfig = () =>
  apiClient.get(`${BASE}/smatch/config`);

export default {
  // Platform
  getStats, getUsers, updateUserRole, deleteUser,
  // QCM Categories
  getQcmCategories, createQcmCategory, updateQcmCategory, deleteQcmCategory,
  // QCM Tags
  getQcmTags, createQcmTag, updateQcmTag, deleteQcmTag,
  // QCM Questions
  getQcmQuestions, getQcmQuestion, createQcmQuestion, updateQcmQuestion,
  updateQcmQuestionStatus, deleteQcmQuestion, getQcmConfig, importQcmQuestions,
  // QCM Contributions
  getContributions, getContributionsCount, approveContribution, rejectContribution,
  // QCM Sessions
  getQcmSessions, forceCompleteQcmSession, deleteQcmSession,
  // Smatch Decks
  getSmatchDecks, getSmatchDeck, createSmatchDeck, updateSmatchDeck,
  updateSmatchDeckStatus, deleteSmatchDeck,
  // Smatch Pairs
  getSmatchPairs, createSmatchPair, createSmatchPairsBulk, replaceSmatchPairs, updateSmatchPair, deleteSmatchPair,
  // Smatch Sessions
  getSmatchSessions, getSmatchSession, deleteSmatchSession, getSmatchConfig,
};
