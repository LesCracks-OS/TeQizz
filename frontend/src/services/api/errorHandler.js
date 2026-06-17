/**
 * Global Error Handler for API Calls
 * 
 * This module provides centralized error handling for all API requests.
 * It transforms various error types into a consistent format and can
 * trigger toast notifications for user feedback.
 */

import { toast } from '@/contexts/ToastContext';

/**
 * Error types for classification
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * HTTP status code mappings
 */
const StatusCodeMap = {
  400: ErrorTypes.VALIDATION,
  401: ErrorTypes.UNAUTHORIZED,
  403: ErrorTypes.FORBIDDEN,
  404: ErrorTypes.NOT_FOUND,
  408: ErrorTypes.TIMEOUT,
  500: ErrorTypes.SERVER,
  502: ErrorTypes.SERVER,
  503: ErrorTypes.SERVER,
  504: ErrorTypes.TIMEOUT,
};

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, type, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Check if error is of a specific type
   */
  isType(errorType) {
    return this.type === errorType;
  }

  /**
   * Check if error is retryable
   */
  isRetryable() {
    return [ErrorTypes.NETWORK, ErrorTypes.TIMEOUT, ErrorTypes.SERVER].includes(this.type);
  }
}

/**
 * Parse error from various sources and normalize
 */
export function parseError(error) {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Network errors (no response)
  if (!error.response && error.request) {
    return new ApiError(
      'Network error. Please check your connection.',
      ErrorTypes.NETWORK,
      0
    );
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new ApiError(
      'Request timed out. Please try again.',
      ErrorTypes.TIMEOUT,
      408
    );
  }

  // HTTP errors with response
  if (error.response) {
    const { status, data } = error.response;
    const type = StatusCodeMap[status] || ErrorTypes.UNKNOWN;
    const message = data?.message || data?.error || getDefaultMessage(status);

    return new ApiError(message, type, status, data);
  }

  // Fetch API errors
  if (error.name === 'TypeError' && error.message?.includes('fetch')) {
    return new ApiError(
      'Network error. Please check your connection.',
      ErrorTypes.NETWORK,
      0
    );
  }

  // Unknown errors
  return new ApiError(
    error.message || 'An unexpected error occurred.',
    ErrorTypes.UNKNOWN,
    0
  );
}

/**
 * Get default error message for HTTP status codes
 */
function getDefaultMessage(status) {
  const messages = {
    400: 'Invalid request. Please check your input.',
    401: 'Authentication required. Please log in.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    408: 'Request timed out. Please try again.',
    500: 'Server error. Please try again later.',
    502: 'Server is temporarily unavailable.',
    503: 'Service unavailable. Please try again later.',
    504: 'Request timed out. Please try again.',
  };
  return messages[status] || 'An error occurred. Please try again.';
}

/**
 * Handle error with optional toast notification
 * @param {Error} error - The error to handle
 * @param {Object} options - Handling options
 * @param {boolean} options.showToast - Whether to show a toast notification
 * @param {string} options.fallbackMessage - Fallback message if error has no message
 * @returns {ApiError} Normalized error
 */
export function handleError(error, options = {}) {
  const { showToast = true, fallbackMessage = 'An error occurred' } = options;
  const apiError = parseError(error);

  // Log error for debugging
  console.error('[API Error]', {
    type: apiError.type,
    status: apiError.status,
    message: apiError.message,
    data: apiError.data,
    timestamp: apiError.timestamp,
  });

  // Show toast notification
  if (showToast) {
    const toastMessage = apiError.message || fallbackMessage;
    
    // Choose toast type based on error type
    switch (apiError.type) {
      case ErrorTypes.UNAUTHORIZED:
        toast.warning(toastMessage, { description: 'Your session may have expired' });
        break;
      case ErrorTypes.VALIDATION:
        toast.warning(toastMessage);
        break;
      case ErrorTypes.NETWORK:
      case ErrorTypes.TIMEOUT:
        toast.loading(toastMessage, { duration: 3000 });
        break;
      default:
        toast.error(toastMessage);
    }
  }

  return apiError;
}

/**
 * Create an error handler with pre-configured options
 */
export function createErrorHandler(defaultOptions = {}) {
  return (error, options = {}) => {
    return handleError(error, { ...defaultOptions, ...options });
  };
}

export default {
  ApiError,
  ErrorTypes,
  parseError,
  handleError,
  createErrorHandler,
};