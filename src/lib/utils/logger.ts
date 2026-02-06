/**
 * Centralized logging utility
 * Only logs warnings and errors in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log info (only in development)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log warning (always)
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Log error (always)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log debug (only in development)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
};
