// src/utils/helpers.js

/**
 * Format time duration from milliseconds to readable format
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time (e.g., "5m 30s")
 */
export const formatTime = (milliseconds) => {
  if (!milliseconds) return 'N/A';
  
  const totalMinutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  
  if (totalMinutes === 0) {
    return `${seconds}s`;
  }
  
  return `${totalMinutes}m ${seconds}s`;
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Get performance color class based on score
 * @param {number} score - Score percentage
 * @returns {string} CSS classes for styling
 */
export const getPerformanceColor = (score) => {
  if (score >= 90) return 'text-green-600 bg-green-100 border-green-300';
  if (score >= 75) return 'text-blue-600 bg-blue-100 border-blue-300';
  if (score >= 60) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
  return 'text-red-600 bg-red-100 border-red-300';
};

/**
 * Get performance label based on score
 * @param {number} score - Score percentage
 * @returns {string} Performance label
 */
export const getPerformanceLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Average';
  return 'Needs Improvement';
};

/**
 * Calculate accuracy percentage
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions
 * @returns {number} Accuracy percentage
 */
export const calculateAccuracy = (correct, total) => {
  if (total === 0) return 0;
  return (correct / total) * 100;
};

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and messages
 */
export const validatePassword = (password) => {
  const messages = [];
  let isValid = true;

  if (password.length < 6) {
    messages.push('Password must be at least 6 characters long');
    isValid = false;
  }

  if (!/[A-Z]/.test(password)) {
    messages.push('Password must contain at least one uppercase letter');
    isValid = false;
  }

  if (!/[0-9]/.test(password)) {
    messages.push('Password must contain at least one number');
    isValid = false;
  }

  return { isValid, messages };
};

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate random color for avatars or charts
 * @param {string} seed - Seed string for consistent colors
 * @returns {string} Hex color code
 */
export const generateColor = (seed = '') => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  if (!seed) {
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Convert snake_case to Title Case
 * @param {string} str - String in snake_case
 * @returns {string} String in Title Case
 */
export const toTitleCase = (str) => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Sort array by multiple criteria
 * @param {Array} array - Array to sort
 * @param {Array} sortKeys - Array of sort criteria [{ key, order }]
 * @returns {Array} Sorted array
 */
export const multiSort = (array, sortKeys) => {
  return array.sort((a, b) => {
    for (const { key, order = 'asc' } of sortKeys) {
      let aVal = a[key];
      let bVal = b[key];
      
      // Handle dates
      if (aVal instanceof Date) aVal = aVal.getTime();
      if (bVal instanceof Date) bVal = bVal.getTime();
      
      // Handle strings
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
};

/**
 * Calculate statistics from number array
 * @param {Array} numbers - Array of numbers
 * @returns {Object} Statistics object
 */
export const calculateStats = (numbers) => {
  if (!numbers.length) {
    return { min: 0, max: 0, average: 0, median: 0 };
  }
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    average: sum / numbers.length,
    median: sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
  };
};

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Filename for the CSV
 * @param {Array} headers - Optional custom headers
 */
export const exportToCSV = (data, filename, headers = null) => {
  if (!data.length) return;
  
  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows = [
    csvHeaders.join(','),
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ];
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  
  window.URL.revokeObjectURL(url);
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Check if user is online
 * @returns {boolean} Online status
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
};

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Check if device is mobile
 * @returns {boolean} Is mobile device
 */
export const isMobile = () => {
  return window.innerWidth <= 768;
};

/**
 * Smooth scroll to element
 * @param {string} elementId - ID of element to scroll to
 * @param {number} offset - Offset from top in pixels
 */
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }
};