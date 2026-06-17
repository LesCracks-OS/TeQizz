/**
 * Toast Notification System using Sonner
 * 
 * Provides a centralized toast notification system with:
 * - Auto-dismiss with configurable duration
 * - Manual dismiss capability
 * - Deduplication (same toast won't appear twice)
 * - Toast update/reuse for identical messages
 * - Multiple toast types (success, error, warning, info)
 * - Clean, non-intrusive UI
 */

import { Toaster, toast as sonnerToast } from 'sonner';

// Toast types enum for consistency
export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading',
};

// Default durations per type (in milliseconds)
const DEFAULT_DURATIONS = {
  [ToastType.SUCCESS]: 4000,
  [ToastType.ERROR]: 6000,
  [ToastType.WARNING]: 5000,
  [ToastType.INFO]: 4000,
  [ToastType.LOADING]: Infinity,
};

// Track active toast IDs for deduplication
const activeToasts = new Map();

/**
 * Generate a unique ID for toast deduplication
 * Uses type + message as key to prevent duplicates
 */
function generateToastId(type, message, options = {}) {
  return options.id || `${type}:${message}`;
}

/**
 * Show a toast notification
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {string} message - Toast message
 * @param {Object} options - Additional options
 * @param {string} [options.description] - Optional description
 * @param {number} [options.duration] - Custom duration in ms
 * @param {string} [options.id] - Custom ID for deduplication
 * @param {boolean} [options.dismissible] - Whether toast can be dismissed
 * @param {Function} [options.onDismiss] - Callback when toast is dismissed
 * @param {Function} [options.onAutoClose] - Callback when toast auto-closes
 * @returns {string|number} Toast ID
 */
function showToast(type, message, options = {}) {
  const toastId = generateToastId(type, message, options);
  const duration = options.duration ?? DEFAULT_DURATIONS[type];

  // Check if toast with same ID already exists
  if (activeToasts.has(toastId)) {
    // Update existing toast instead of creating duplicate
    sonnerToast[ToastType.LOADING]?.(message, {
      id: toastId,
      ...options,
      duration,
    });
    return toastId;
  }

  // Track this toast
  activeToasts.set(toastId, { type, message, options });

  const toastOptions = {
    id: toastId,
    description: options.description,
    duration,
    dismissible: options.dismissible ?? true,
    onDismiss: (toast) => {
      activeToasts.delete(toastId);
      options.onDismiss?.(toast);
    },
    onAutoClose: (toast) => {
      activeToasts.delete(toastId);
      options.onAutoClose?.(toast);
    },
  };

  // Call appropriate sonner toast method
  switch (type) {
    case ToastType.SUCCESS:
      return sonnerToast.success(message, toastOptions);
    case ToastType.ERROR:
      return sonnerToast.error(message, toastOptions);
    case ToastType.WARNING:
      return sonnerToast.warning(message, toastOptions);
    case ToastType.INFO:
      return sonnerToast.info(message, toastOptions);
    case ToastType.LOADING:
      return sonnerToast.loading(message, toastOptions);
    default:
      return sonnerToast(message, toastOptions);
  }
}

/**
 * Dismiss a specific toast
 * @param {string|number} toastId - ID of toast to dismiss
 */
function dismiss(toastId) {
  sonnerToast.dismiss(toastId);
  activeToasts.delete(toastId);
}

/**
 * Dismiss all active toasts
 */
function dismissAll() {
  sonnerToast.dismiss();
  activeToasts.clear();
}

/**
 * Update an existing toast
 * @param {string|number} toastId - ID of toast to update
 * @param {Object} options - New options
 */
function update(toastId, options) {
  sonnerToast[options.type || 'info']?.(options.message, {
    id: toastId,
    ...options,
  });
}

/**
 * Promise-based toast for async operations
 * @param {Promise} promise - Promise to track
 * @param {Object} messages - Messages for different states
 * @param {string} messages.loading - Loading message
 * @param {string} messages.success - Success message
 * @param {string} messages.error - Error message
 * @returns {Promise} Original promise
 */
function promise(promise, messages) {
  return sonnerToast.promise(promise, messages);
}

/**
 * Toast API object
 */
const toast = {
  success: (message, options = {}) => showToast(ToastType.SUCCESS, message, options),
  error: (message, options = {}) => showToast(ToastType.ERROR, message, options),
  warning: (message, options = {}) => showToast(ToastType.WARNING, message, options),
  info: (message, options = {}) => showToast(ToastType.INFO, message, options),
  loading: (message, options = {}) => showToast(ToastType.LOADING, message, options),
  dismiss,
  dismissAll,
  update,
  promise,
};

/**
 * Custom hook to use toast notifications
 * Provides the toast API for use in components
 */
export function useToast() {
  return toast;
}

/**
 * Toast Provider Component
 * Wrap your app with this to enable toast notifications
 */
export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'group font-sans',
            title: 'text-sm font-medium',
            description: 'text-xs text-muted-foreground',
            actionButton: 'bg-primary text-primary-foreground',
            cancelButton: 'bg-muted text-muted-foreground',
            closeButton: 'bg-transparent border-border hover:bg-muted',
            success: 'border-green-500/50 bg-green-500/10',
            error: 'border-red-500/50 bg-red-500/10',
            warning: 'border-yellow-500/50 bg-yellow-500/10',
            info: 'border-blue-500/50 bg-blue-500/10',
          },
        }}
        expand={false}
        richColors
        closeButton
        duration={5000}
        gap={8}
      />
    </>
  );
}

// Export both named and default
export { toast };
export default ToastProvider;