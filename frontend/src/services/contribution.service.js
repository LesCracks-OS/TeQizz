import apiClient from './api/apiClient';

const BASE = '/api/v1/contributions';

const submitQuestion = (data) =>
  apiClient.post(`${BASE}/questions`, data);

const submitQuestions = (questions) =>
  apiClient.post(`${BASE}/questions/bulk`, questions);

const getMySubmissions = () =>
  apiClient.get(`${BASE}/questions/mine`);

const withdrawSubmission = (id) =>
  apiClient.delete(`${BASE}/questions/${id}`);

export default {
  submitQuestion,
  submitQuestions,
  getMySubmissions,
  withdrawSubmission,
};
