/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

// Utility function to combine class names
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Creates a page URL based on the page name
 * @param {string} pageName - The name of the page
 * @returns {string} The URL for the page
 */
export function createPageUrl(pageName) {
  const pageRoutes = {
    // Candidate routes
    CandidateDashboard: '/candidate/dashboard',
    ATSChecker: '/candidate/ats-checker',
    TechnicalTest: '/candidate/technical-test',
    InterviewRoom: '/candidate/interview',
    
    // HR routes
    HRDashboard: '/hr/dashboard',
    CandidateManagement: '/hr/candidates',
    Analytics: '/hr/analytics',
    Settings: '/hr/settings',
    
    // Common routes
    Home: '/',
    Login: '/login',
    Register: '/register',
    Profile: '/profile',
    LiveInterview: '/interview/live',
  };

  return pageRoutes[pageName] || '/';
}

/**
 * Formats a date string to a readable format
 * @param {string|Date} date - The date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Formats a date string to include time
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats time duration in minutes to a readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export function formatDuration(minutes) {
  if (!minutes || minutes < 0) return '0 minutes';
  
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to title case
 * @param {string} str - The string to convert
 * @returns {string} Title case string
 */
export function toTitleCase(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Truncates text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + suffix;
}

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if valid phone number
 */
export function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Generates a random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounces a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clones an object
 * @param {any} obj - The object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Formats a score as a percentage
 * @param {number} score - The score to format
 * @param {number} total - The total possible score
 * @returns {string} Formatted percentage
 */
export function formatScore(score, total = 100) {
  if (!score && score !== 0) return 'N/A';
  const percentage = (score / total) * 100;
  return `${Math.round(percentage)}%`;
}

/**
 * Gets the color class for a score
 * @param {number} score - The score
 * @param {number} total - The total possible score
 * @returns {string} Color class name
 */
export function getScoreColor(score, total = 100) {
  if (!score && score !== 0) return 'gray';
  const percentage = (score / total) * 100;
  
  if (percentage >= 80) return 'green';
  if (percentage >= 60) return 'yellow';
  if (percentage >= 40) return 'orange';
  return 'red';
}

/**
 * Formats file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - The value to check
 * @returns {boolean} True if empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Safely parses JSON with error handling
 * @param {string} jsonString - The JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} Parsed object or default value
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return defaultValue;
  }
}

/**
 * Creates a delay/sleep function
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  createPageUrl,
  formatDate,
  formatDateTime,
  formatDuration,
  capitalize,
  toTitleCase,
  truncateText,
  isValidEmail,
  isValidPhone,
  generateId,
  debounce,
  deepClone,
  formatScore,
  getScoreColor,
  formatFileSize,
  isEmpty,
  safeJsonParse,
  delay,
};