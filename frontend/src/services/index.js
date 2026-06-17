/**
 * Services Barrel Export
 * 
 * Central export point for all services.
 * Import services from here for cleaner imports.
 * 
 * Example:
 * import { authService, userService } from '@/services';
 */

// API Core
export { default as apiClient } from './api/apiClient';
export { default as errorHandler } from './api/errorHandler';
export { default as ENDPOINTS, API_BASE_URL } from './api/endpoints';
export { ApiError, ErrorTypes, handleError, parseError } from './api/errorHandler';

// Domain Services
export { default as authService } from './auth.service';
export { default as userService } from './user.service';

// Re-export token utilities
export { getAuthToken, setAuthToken, removeAuthToken } from './api/apiClient';