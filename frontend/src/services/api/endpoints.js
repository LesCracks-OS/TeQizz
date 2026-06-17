/**
 * Centralized API Endpoints Configuration
 * 
 * This file contains all API endpoint paths used in the application.
 * Centralizing endpoints makes it easier to maintain and update API paths.
 * 
 * Backend routes:
 * - Auth: POST /auth/register, POST /auth/login, POST /auth/logout
 * - Users: GET /api/users, GET /api/users/{id}, GET /api/users/me, 
 *          GET /api/users/email/{email}, PUT /api/users/{id}, DELETE /api/users/{id}
 */

export const API_BASE_URL = '/api';

export const ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    OAUTH: (provider) => `/oauth2/authorization/${provider}`,
    OAUTH_CALLBACK: '/oauth/callback',
  },

  // User endpoints
  USERS: {
    ME: '/api/users/me',
    BY_ID: (id) => `/api/users/${id}`,
    BY_EMAIL: (email) => `/api/users/email/${email}`,
    UPDATE: (id) => `/api/users/${id}`,
    DELETE: (id) => `/api/users/${id}`,
    UPLOAD_AVATAR: '/api/users/me/avatar',
  },

  // QCM Game endpoints
  QCM_GAME: {
    CREATE_SESSION: '/api/v1/games/qcm/sessions',
    GET_SESSION: (sessionId) => `/api/v1/games/qcm/sessions/${sessionId}`,
    GET_NEXT_QUESTION: (sessionId) => `/api/v1/games/qcm/sessions/${sessionId}/questions/next`,
    SUBMIT_ANSWER: (sessionId) => `/api/v1/games/qcm/sessions/${sessionId}/answers`,
    GET_RESULTS: (sessionId) => `/api/v1/games/qcm/sessions/${sessionId}/results`,
    ABANDON_SESSION: (sessionId) => `/api/v1/games/qcm/sessions/${sessionId}`,
  },

  // Category endpoints
  CATEGORIES: {
    LIST: '/api/categories',
    BY_ID: (id) => `/api/categories/${id}`,
  },

  // Tag endpoints
  TAGS: {
    LIST: '/api/tags',
    BY_ID: (id) => `/api/tags/${id}`,
    BY_CATEGORY: (categoryId) => `/api/tags/category/${categoryId}`,
  },

  // Quiz/Game endpoints (legacy)
  QUIZ: {
    LIST: '/api/quiz',
    BY_ID: (id) => `/api/quiz/${id}`,
    CATEGORIES: '/api/quiz/categories',
    SUBMIT: '/api/quiz/submit',
  },

  // Leaderboard endpoints
  LEADERBOARD: {
    GLOBAL: '/api/leaderboard',
    BY_CATEGORY: (category) => `/api/leaderboard/${category}`,
    USER_RANK: '/api/leaderboard/me',
  },

  // Performance endpoints
  PERFORMANCE: {
    STATS: '/api/performance/stats',
    HISTORY: '/api/performance/history',
    BY_CATEGORY: '/api/performance/category',
  },
};

export default ENDPOINTS;