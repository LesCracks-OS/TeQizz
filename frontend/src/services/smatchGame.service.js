/**
 * Smatch Game Service — matching game (term ↔ definition).
 * Endpoints under /api/v1/games/smatch. Each helper returns the unwrapped payload.
 */
import apiClient from './api/apiClient';

const BASE = '/api/v1/games/smatch';

const getDecks = async (categoryId, tagId) => {
  const params = {};
  if (categoryId) params.categoryId = categoryId;
  if (tagId) params.tagId = tagId;
  const r = await apiClient.get(`${BASE}/decks`, { params });
  return r.data;
};

const getDeck = async (deckId) => {
  const r = await apiClient.get(`${BASE}/decks/${deckId}`);
  return r.data;
};

const startSession = async ({ deckId, gameMode }) => {
  const r = await apiClient.post(`${BASE}/sessions`, { deckId, gameMode });
  return r.data;
};

const getSession = async (sessionId) => {
  const r = await apiClient.get(`${BASE}/sessions/${sessionId}`);
  return r.data;
};

const submitAttempt = async (sessionId, { termPairId, definitionPairId, timeTakenMs }) => {
  const r = await apiClient.post(`${BASE}/sessions/${sessionId}/attempts`,
    { termPairId, definitionPairId, timeTakenMs });
  return r.data;
};

const getResults = async (sessionId) => {
  const r = await apiClient.get(`${BASE}/sessions/${sessionId}/results`);
  return r.data;
};

const abandonSession = async (sessionId) => {
  await apiClient.delete(`${BASE}/sessions/${sessionId}`);
};

export default {
  getDecks,
  getDeck,
  startSession,
  getSession,
  submitAttempt,
  getResults,
  abandonSession,
};
