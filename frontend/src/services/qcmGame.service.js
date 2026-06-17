/**
 * QCM Game Service
 * 
 * Service for handling all QCM game API operations including:
 * - Creating game sessions
 * - Fetching questions
 * - Submitting answers
 * - Retrieving results
 * - User statistics
 * - Leaderboard
 */

import apiClient from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';

/**
 * Create a new QCM game session
 * @param {Object} config - Game configuration
 * @param {number} config.categoryId - Category ID for questions
 * @param {number[]} [config.tagIds] - Optional tag IDs to filter questions
 * @param {number} config.numberOfQuestions - Number of questions (5-50)
 * @param {number} [config.lives=3] - Number of lives
 * @param {boolean} [config.showHints=true] - Show hints during game
 * @param {boolean} [config.showExplanations=true] - Show explanations after answering
 * @param {number} [config.timeLimitPerQuestion=30] - Time limit per question in seconds
 * @returns {Promise<Object>} Game session response
 */
export const createGameSession = async (config) => {
  const response = await apiClient.post(ENDPOINTS.QCM_GAME.CREATE_SESSION, config);
  return response.data;
};

/**
 * Get the next question in a game session
 * @param {number} sessionId - Game session ID
 * @returns {Promise<Object>} Question data with answers (correct answer not revealed)
 */
export const getNextQuestion = async (sessionId) => {
  const response = await apiClient.get(ENDPOINTS.QCM_GAME.GET_NEXT_QUESTION(sessionId));
  return response.data;
};

/**
 * Submit an answer for the current question
 * @param {number} sessionId - Game session ID
 * @param {Object} answerData - Answer submission data
 * @param {number} answerData.questionId - Question ID
 * @param {number} answerData.selectedAnswerId - Selected answer ID
 * @param {number} [answerData.timeTakenSeconds] - Time taken to answer
 * @param {boolean} [answerData.usedHint=false] - Whether hint was used
 * @returns {Promise<Object>} Answer submission response with updated game state
 */
export const submitAnswer = async (sessionId, answerData) => {
  const response = await apiClient.post(ENDPOINTS.QCM_GAME.SUBMIT_ANSWER(sessionId), answerData);
  return response.data;
};

/**
 * Get the final results of a completed game session
 * @param {number} sessionId - Game session ID
 * @returns {Promise<Object>} Complete game results with question reviews
 */
export const getGameResults = async (sessionId) => {
  const response = await apiClient.get(ENDPOINTS.QCM_GAME.GET_RESULTS(sessionId));
  return response.data;
};

/**
 * Get the current state of a game session
 * @param {number} sessionId - Game session ID
 * @returns {Promise<Object>} Current session state
 */
export const getSessionState = async (sessionId) => {
  const response = await apiClient.get(ENDPOINTS.QCM_GAME.GET_SESSION(sessionId));
  return response.data;
};

/**
 * Abandon a game session
 * @param {number} sessionId - Game session ID
 * @returns {Promise<void>}
 */
export const abandonGameSession = async (sessionId) => {
  await apiClient.delete(ENDPOINTS.QCM_GAME.ABANDON_SESSION(sessionId));
};

/**
 * Get all available categories
 * @returns {Promise<Object[]>} List of categories
 */
export const getCategories = async () => {
  const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST);
  return response.data;
};

/**
 * Get tags by category
 * @param {number} categoryId - Category ID
 * @returns {Promise<Object[]>} List of tags for the category
 */
export const getTagsByCategory = async (categoryId) => {
  const response = await apiClient.get(ENDPOINTS.TAGS.BY_CATEGORY(categoryId));
  return response.data;
};

/**
 * Get comprehensive QCM statistics for the current user
 * @returns {Promise<Object>} User's QCM statistics
 */
export const getUserStats = async () => {
  const response = await apiClient.get('/api/v1/games/qcm/stats');
  return response.data;
};

/**
 * Get QCM leaderboard
 * @param {Object} params - Query parameters
 * @param {number} [params.page=0] - Page number (0-indexed)
 * @param {number} [params.size=10] - Page size
 * @param {number} [params.categoryId] - Optional category filter
 * @returns {Promise<Object>} Leaderboard data with entries and pagination info
 */
export const getLeaderboard = async (params = {}) => {
  const { page = 0, size = 10, categoryId, gameMode } = params;
  const queryParams = new URLSearchParams({ page, size });
  if (categoryId) queryParams.append('categoryId', categoryId);
  if (gameMode && gameMode !== 'ALL') queryParams.append('gameMode', gameMode);

  const response = await apiClient.get(`/api/v1/games/qcm/leaderboard?${queryParams}`);
  return response.data;
};

export const resetUserStats = async () => {
  const response = await apiClient.delete('/api/v1/games/qcm/stats');
  return response.data;
};

export default {
  createGameSession,
  getNextQuestion,
  submitAnswer,
  getGameResults,
  getSessionState,
  abandonGameSession,
  getCategories,
  getTagsByCategory,
  getUserStats,
  getLeaderboard,
  resetUserStats,
};
