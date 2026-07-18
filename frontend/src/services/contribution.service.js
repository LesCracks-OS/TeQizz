import apiClient from './api/apiClient';

const BASE = '/api/v1/contributions';

const submitQuestion = (data) =>
  apiClient.post(`${BASE}/questions`, data);

const submitQuestions = (questions) =>
  apiClient.post(`${BASE}/questions/bulk`, questions);

const getMySubmissions = () =>
  apiClient.get(`${BASE}/questions/mine`);

const findSimilarQuestions = (content) =>
  apiClient.get(`${BASE}/questions/similar`, { params: { content } });

// ─── Smatch contributions (distinct flow) ───────────────────────────────────
const submitSmatchDeck = (data) =>
  apiClient.post(`${BASE}/smatch/decks`, data);

const getMySmatchSubmissions = () =>
  apiClient.get(`${BASE}/smatch/decks/mine`);

const withdrawSmatchSubmission = (id) =>
  apiClient.delete(`${BASE}/smatch/decks/${id}`);

const withdrawSubmission = (id) =>
  apiClient.delete(`${BASE}/questions/${id}`);

export default {
  submitQuestion,
  submitQuestions,
  getMySubmissions,
  withdrawSubmission,
  findSimilarQuestions,
  submitSmatchDeck,
  getMySmatchSubmissions,
  withdrawSmatchSubmission,
};
