/**
 * User Service
 * 
 * Handles all user-related API operations:
 * - Profile management
 * - Account settings
 * 
 * Backend routes:
 * - GET /api/users/me - Get current user
 * - GET /api/users/{id} - Get user by ID
 * - GET /api/users/email/{email} - Get user by email
 * - PUT /api/users/{id} - Update user
 * - DELETE /api/users/{id} - Delete user
 */

import apiClient from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';
import { handleError, ApiError } from './api/errorHandler';
import { toast } from '@/contexts/ToastContext';

/**
 * User result interface
 * @typedef {Object} UserResult
 * @property {boolean} success - Whether the operation succeeded
 * @property {Object} [data] - Response data on success
 * @property {string} [error] - Error message on failure
 * @property {ApiError} [apiError] - Detailed API error on failure
 */

/**
 * Get current user profile
 * @returns {Promise<UserResult>}
 */
async function getProfile() {
  try {
    const response = await apiClient.get(ENDPOINTS.USERS.ME);
    const user = response.data || response;

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    const apiError = handleError(error, { showToast: false });

    return {
      success: false,
      error: apiError.message,
      apiError,
    };
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID to update
 * @param {Object} profileData - Profile data to update
 * @param {string} [profileData.firstName] - First name
 * @param {string} [profileData.lastName] - Last name
 * @param {string} [profileData.username] - Username
 * @param {string} [profileData.email] - Email
 * @returns {Promise<UserResult>}
 */
async function updateProfile(userId, profileData) {
  try {
    const response = await apiClient.put(ENDPOINTS.USERS.UPDATE(userId), profileData);
    const user = response.data || response;

    toast.success('Profile updated successfully');

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    const apiError = handleError(error, { showToast: false });
    
    toast.error(apiError.message || 'Failed to update profile');

    return {
      success: false,
      error: apiError.message,
      apiError,
    };
  }
}

/**
 * Delete user account
 * @param {string} userId - User ID to delete
 * @returns {Promise<UserResult>}
 */
async function deleteAccount(userId) {
  try {
    const response = await apiClient.delete(ENDPOINTS.USERS.DELETE(userId));

    toast.success('Account deleted successfully');

    return {
      success: true,
      data: response.data || response,
    };
  } catch (error) {
    const apiError = handleError(error, { showToast: false });
    
    toast.error(apiError.message || 'Failed to delete account');

    return {
      success: false,
      error: apiError.message,
      apiError,
    };
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<UserResult>}
 */
async function getUserById(userId) {
  try {
    const response = await apiClient.get(ENDPOINTS.USERS.BY_ID(userId));

    return {
      success: true,
      data: response.data || response,
    };
  } catch (error) {
    const apiError = handleError(error, { showToast: false });

    return {
      success: false,
      error: apiError.message,
      apiError,
    };
  }
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<UserResult>}
 */
async function getUserByEmail(email) {
  try {
    const response = await apiClient.get(ENDPOINTS.USERS.BY_EMAIL(email));

    return {
      success: true,
      data: response.data || response,
    };
  } catch (error) {
    const apiError = handleError(error, { showToast: false });

    return {
      success: false,
      error: apiError.message,
      apiError,
    };
  }
}

/**
 * Upload avatar image for current user.
 * @param {File} file - Image file (jpg/png/gif, max 5 MB)
 * @returns {Promise<UserResult>}
 */
async function uploadAvatar(file) {
  try {
    const form = new FormData();
    form.append('file', file);
    const response = await apiClient.post(ENDPOINTS.USERS.UPLOAD_AVATAR, form);
    const user = response.data || response;
    toast.success('Photo de profil mise à jour');
    return { success: true, data: user };
  } catch (error) {
    const apiError = handleError(error, { showToast: false });
    toast.error(apiError.message || 'Échec de l\'upload');
    return { success: false, error: apiError.message, apiError };
  }
}

/**
 * User Service Object
 */
const userService = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  getUserById,
  getUserByEmail,
};

export default userService;