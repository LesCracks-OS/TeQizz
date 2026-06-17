/**
 * Authentication Service
 * 
 * Handles all authentication-related API operations:
 * - Login (email/password)
 * - Registration
 * - OAuth authentication
 * - Logout
 * - Token management
 * - Session verification
 */

import apiClient, { setAuthToken, removeAuthToken, getAuthToken } from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';
import { handleError, ApiError, ErrorTypes } from './api/errorHandler';
import { toast } from '@/contexts/ToastContext';

/**
 * Authentication result interface
 * @typedef {Object} AuthResult
 * @property {boolean} success - Whether the operation succeeded
 * @property {Object} [user] - User data on success
 * @property {string} [token] - Auth token on success
 * @property {string} [error] - Error message on failure
 * @property {ApiError} [apiError] - Detailed API error on failure
 */

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<AuthResult>}
 */
async function login(email, password) {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    // Extract data from response
    const { accessToken, user } = response.data || response;

    // Store token
    if (accessToken) {
      setAuthToken(accessToken);
    }

    toast.success('Welcome back!');

    return {
      success: true,
      user,
      token: accessToken,
    };
  } catch (error) {
    const apiError = handleError(error, { showToast: false });
    
    // Show specific error message
    toast.error(apiError.message || 'Login failed. Please check your credentials.');

    return {
      success: false,
      error: apiError.message,
      apiError,
    };
  }
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.firstName - User first name
 * @param {string} userData.lastName - User last name
 * @param {string} userData.username - User username
 * @returns {Promise<AuthResult>}
 */
async function register(userData) {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);

    // Extract data from response
    const { accessToken, user } = response.data || response;

    // Store token
    if (accessToken) {
      setAuthToken(accessToken);
    }

    toast.success('Account created successfully!');

    return {
      success: true,
      user,
      token: accessToken,
    };
  } catch (error) {
    const apiError = handleError(error, { showToast: false });
    
    toast.error(apiError.message || 'Registration failed. Please try again.');

    return {
      success: false,
      error: apiError.message,
      apiError,
    };
  }
}

/**
 * Logout the current user
 * @returns {Promise<{success: boolean}>}
 */
async function logout() {
  try {
    // Call logout endpoint to invalidate token on server
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    // Log error but don't show toast - we're logging out anyway
    console.error('Logout API call failed:', error);
  } finally {
    // Always remove local token
    removeAuthToken();
    toast.success('Logged out successfully');
  }

  return { success: true };
}

/**
 * Initiate OAuth login flow
 * @param {string} provider - OAuth provider (google, github, etc.)
 */
function oauthLogin(provider) {
  // Redirect to backend OAuth endpoint
  window.location.href = ENDPOINTS.AUTH.OAUTH(provider);
}

/**
 * Handle OAuth callback
 * @param {string} token - Token received from OAuth callback
 * @returns {AuthResult}
 */
function handleOAuthCallback(token) {
  if (!token) {
    toast.error('Authentication failed. No token received.');
    return {
      success: false,
      error: 'No token received from OAuth provider',
    };
  }

  // Store the token
  setAuthToken(token);
  
  toast.success('Successfully signed in!');

  return {
    success: true,
    token,
  };
}

/**
 * Get current authenticated user
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
async function getCurrentUser() {
  try {
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    const response = await apiClient.get(ENDPOINTS.USERS.ME);
    const user = response.data || response;

    return {
      success: true,
      user,
    };
  } catch (error) {
    const apiError = handleError(error, { showToast: false });

    // If unauthorized, clear token
    if (apiError.isType(ErrorTypes.UNAUTHORIZED)) {
      removeAuthToken();
    }

    return {
      success: false,
      error: apiError.message,
      apiError,
    };
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Verify current session is valid
 * @returns {Promise<boolean>}
 */
async function verifySession() {
  const token = getAuthToken();
  if (!token) {
    return false;
  }

  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

/**
 * Authentication Service Object
 */
const authService = {
  login,
  register,
  logout,
  oauthLogin,
  handleOAuthCallback,
  getCurrentUser,
  isAuthenticated,
  verifySession,
  // Token utilities
  getAuthToken,
  setAuthToken,
  removeAuthToken,
};

export default authService;