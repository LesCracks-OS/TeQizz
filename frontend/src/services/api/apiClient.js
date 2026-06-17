/**
 * API Client - Central HTTP Client for All API Requests
 * 
 * This module provides a unified HTTP client with:
 * - Automatic authentication token injection
 * - Request/Response interceptors
 * - Timeout management
 * - Error handling integration
 * - Request cancellation support
 */

import { handleError, ApiError, ErrorTypes } from './errorHandler';

// Configuration constants
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const TOKEN_KEY = 'auth_token';

/**
 * In-memory request queue for deduplication
 */
const pendingRequests = new Map();

/**
 * Generate a unique key for request deduplication
 */
function generateRequestKey(method, url, data) {
  const dataHash = data ? JSON.stringify(data) : '';
  return `${method.toUpperCase()}:${url}:${dataHash}`;
}

/**
 * Get authentication token from storage
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Set authentication token in storage
 */
export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Failed to set auth token:', error);
  }
}

/**
 * Remove authentication token from storage
 */
export function removeAuthToken() {
  setAuthToken(null);
}

/**
 * Build full URL with query parameters
 */
function buildUrl(endpoint, params = {}) {
  const url = endpoint.startsWith('http') ? endpoint : endpoint;
  
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Build headers with defaults and auth token
 */
function buildHeaders(customHeaders = {}, includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...customHeaders,
  };

  // Add authorization header if token exists
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  return { controller, timeoutId };
}

/**
 * Process response and handle different content types
 */
async function processResponse(response) {
  // Check if response is ok
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    throw new ApiError(
      errorData.message || errorData.error || 'Request failed',
      ErrorTypes.UNKNOWN,
      response.status,
      errorData
    );
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return null;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * Core request method
 */
async function request(method, endpoint, options = {}) {
  const {
    data = null,
    params = null,
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    includeAuth = true,
    deduplicate = false,
    showToast = true,
    signal: externalSignal,
  } = options;

  const url = buildUrl(endpoint, params);
  const requestKey = generateRequestKey(method, url, data);

  // Check for duplicate pending request
  if (deduplicate && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }

  // Create timeout controller
  const { controller, timeoutId } = createTimeoutController(timeout);

  // Combine external signal with timeout signal
  const combinedSignal = externalSignal
    ? AbortSignal.any([externalSignal, controller.signal])
    : controller.signal;

  const requestConfig = {
    method,
    headers: buildHeaders(headers, includeAuth),
    signal: combinedSignal,
  };

  // Add body for non-GET requests
  if (data && !['GET', 'HEAD'].includes(method.toUpperCase())) {
    if (data instanceof FormData) {
      requestConfig.body = data;
      delete requestConfig.headers['Content-Type'];
    } else {
      requestConfig.body = JSON.stringify(data);
    }
  }

  try {
    // Create request promise
    const requestPromise = (async () => {
      const response = await fetch(url, requestConfig);
      return processResponse(response);
    })();

    // Store in pending requests for deduplication
    if (deduplicate) {
      pendingRequests.set(requestKey, requestPromise);
    }

    const result = await requestPromise;
    return result;
  } catch (error) {
    // Handle abort/timeout
    if (error.name === 'AbortError') {
      throw new ApiError(
        'Request was cancelled or timed out',
        ErrorTypes.TIMEOUT,
        408
      );
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle other errors
    throw handleError(error, { showToast });
  } finally {
    clearTimeout(timeoutId);
    pendingRequests.delete(requestKey);
  }
}

/**
 * API Client Object with HTTP method shortcuts
 */
const apiClient = {
  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return request('GET', endpoint, options);
  },

  /**
   * POST request
   */
  post(endpoint, data, options = {}) {
    return request('POST', endpoint, { ...options, data });
  },

  /**
   * PUT request
   */
  put(endpoint, data, options = {}) {
    return request('PUT', endpoint, { ...options, data });
  },

  /**
   * PATCH request
   */
  patch(endpoint, data, options = {}) {
    return request('PATCH', endpoint, { ...options, data });
  },

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return request('DELETE', endpoint, options);
  },

  /**
   * Raw request method for custom use cases
   */
  request,

  // Utility exports
  getAuthToken,
  setAuthToken,
  removeAuthToken,
};

/**
 * Create a service-specific API client with pre-configured options
 */
export function createApiClient(defaultOptions = {}) {
  return {
    get: (endpoint, options = {}) => request('GET', endpoint, { ...defaultOptions, ...options }),
    post: (endpoint, data, options = {}) => request('POST', endpoint, { ...defaultOptions, ...options, data }),
    put: (endpoint, data, options = {}) => request('PUT', endpoint, { ...defaultOptions, ...options, data }),
    patch: (endpoint, data, options = {}) => request('PATCH', endpoint, { ...defaultOptions, ...options, data }),
    delete: (endpoint, options = {}) => request('DELETE', endpoint, { ...defaultOptions, ...options }),
  };
}

export default apiClient;