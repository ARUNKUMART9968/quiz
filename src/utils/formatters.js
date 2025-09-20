// src/utils/formatters.js
import { PERFORMANCE_LEVELS, DATE_FORMATS } from './constants';

/**
 * Format time duration from various input formats
 */
export const timeFormatters = {
  /**
   * Format milliseconds to readable time
   * @param {number} milliseconds - Time in milliseconds
   * @param {object} options - Formatting options
   * @returns {string} Formatted time string
   */
  fromMilliseconds: (milliseconds, options = {}) => {
    if (!milliseconds || milliseconds < 0) return 'N/A';
    
    const {
      showHours = false,
      showSeconds = true,
      short = false,
      verbose = false
    } = options;

    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    const parts = [];

    if (hours > 0 || showHours) {
      if (verbose) {
        parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
      } else {
        parts.push(`${hours}${short ? 'h' : ' hours'}`);
      }
    }

    if (minutes > 0 || (hours === 0 && seconds === 0)) {
      if (verbose) {
        parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      } else {
        parts.push(`${minutes}${short ? 'm' : ' min'}`);
      }
    }

    if (showSeconds && (seconds > 0 || (hours === 0 && minutes === 0))) {
      if (verbose) {
        parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
      } else {
        parts.push(`${seconds}${short ? 's' : ' sec'}`);
      }
    }

    return parts.join(verbose ? ', ' : ' ');
  },

  /**
   * Format TimeSpan object from backend
   * @param {object} timeSpan - TimeSpan object with totalMilliseconds property
   * @param {object} options - Formatting options
   * @returns {string} Formatted time string
   */
  fromTimeSpan: (timeSpan, options = {}) => {
    if (!timeSpan || typeof timeSpan.totalMilliseconds === 'undefined') {
      return 'N/A';
    }
    
    return timeFormatters.fromMilliseconds(timeSpan.totalMilliseconds, options);
  },

  /**
   * Format seconds to MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} Time in MM:SS format
   */
  toMMSS: (seconds) => {
    if (!seconds || seconds < 0) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Format duration for countdown timer
   * @param {number} seconds - Remaining seconds
   * @returns {string} Formatted countdown
   */
  countdown: (seconds) => {
    if (seconds <= 0) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Date formatting utilities
 */
export const dateFormatters = {
  /**
   * Format date with various options
   * @param {string|Date} date - Date to format
   * @param {string} format - Format type from DATE_FORMATS
   * @returns {string} Formatted date
   */
  format: (date, format = 'SHORT') => {
    if (!date) return 'N/A';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const options = {
      SHORT: { year: 'numeric', month: 'short', day: 'numeric' },
      LONG: { year: 'numeric', month: 'long', day: 'numeric' },
      WITH_TIME: { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      },
      TIME_ONLY: { hour: '2-digit', minute: '2-digit' },
      FULL: { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    };
    
    return dateObj.toLocaleDateString('en-US', options[format] || options.SHORT);
  },

  /**
   * Get relative time (e.g., "2 hours ago")
   * @param {string|Date} date - Date to compare
   * @returns {string} Relative time string
   */
  relative: (date) => {
    if (!date) return 'N/A';
    
    const now = new Date();
    const dateObj = new Date(date);
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    }
    
    const years = Math.floor(diffDays / 365);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  },

  /**
   * Check if date is today
   * @param {string|Date} date - Date to check
   * @returns {boolean} True if date is today
   */
  isToday: (date) => {
    if (!date) return false;
    
    const today = new Date();
    const dateObj = new Date(date);
    
    return dateObj.toDateString() === today.toDateString();
  },

  /**
   * Check if date is this week
   * @param {string|Date} date - Date to check
   * @returns {boolean} True if date is this week
   */
  isThisWeek: (date) => {
    if (!date) return false;
    
    const now = new Date();
    const dateObj = new Date(date);
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7;
  }
};

/**
 * Number formatting utilities
 */
export const numberFormatters = {
  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @param {object} options - Intl.NumberFormat options
   * @returns {string} Formatted number
   */
  withCommas: (num, options = {}) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    
    return new Intl.NumberFormat('en-US', options).format(num);
  },

  /**
   * Format number as percentage
   * @param {number} value - Value to format as percentage
   * @param {number} total - Total value (optional, assumes value is already percentage)
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage
   */
  asPercentage: (value, total = null, decimals = 1) => {
    if (typeof value !== 'number' || isNaN(value)) return '0%';
    
    let percentage = value;
    if (total && total > 0) {
      percentage = (value / total) * 100;
    }
    
    return `${percentage.toFixed(decimals)}%`;
  },

  /**
   * Format number with appropriate suffix (K, M, B)
   * @param {number} num - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted number with suffix
   */
  withSuffix: (num, decimals = 1) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (num < 1000) return num.toString();
    
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const tier = Math.floor(Math.log10(num) / 3);
    
    if (tier === 0) return num.toString();
    
    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;
    
    return `${scaled.toFixed(decimals)}${suffix}`;
  },

  /**
   * Format score with appropriate styling
   * @param {number} score - Score to format
   * @param {object} options - Formatting options
   * @returns {object} Object with formatted score and styling info
   */
  scoreWithStyle: (score, options = {}) => {
    const { decimals = 1, showPercentage = true } = options;
    
    if (typeof score !== 'number' || isNaN(score)) {
      return {
        formatted: '0%',
        level: 'poor',
        color: 'red',
        class: 'text-red-600 bg-red-100'
      };
    }
    
    const formatted = showPercentage 
      ? numberFormatters.asPercentage(score, null, decimals)
      : score.toFixed(decimals);
    
    // Determine performance level
    let level, color, className;
    
    if (score >= PERFORMANCE_LEVELS.EXCELLENT.minScore) {
      level = 'excellent';
      color = 'green';
      className = 'text-green-600 bg-green-100';
    } else if (score >= PERFORMANCE_LEVELS.GOOD.minScore) {
      level = 'good';
      color = 'blue';
      className = 'text-blue-600 bg-blue-100';
    } else if (score >= PERFORMANCE_LEVELS.AVERAGE.minScore) {
      level = 'average';
      color = 'yellow';
      className = 'text-yellow-600 bg-yellow-100';
    } else {
      level = 'poor';
      color = 'red';
      className = 'text-red-600 bg-red-100';
    }
    
    return {
      formatted,
      level,
      color,
      class: className,
      performance: PERFORMANCE_LEVELS[level.toUpperCase()]
    };
  }
};

/**
 * Text formatting utilities
 */
export const textFormatters = {
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add (default: '...')
   * @returns {string} Truncated text
   */
  truncate: (text, maxLength = 50, suffix = '...') => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  /**
   * Convert string to title case
   * @param {string} str - String to convert
   * @returns {string} Title case string
   */
  toTitleCase: (str) => {
    if (!str || typeof str !== 'string') return '';
    
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },

  /**
   * Convert camelCase or snake_case to readable text
   * @param {string} str - String to convert
   * @returns {string} Readable text
   */
  toReadable: (str) => {
    if (!str || typeof str !== 'string') return '';
    
    return str
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^./, (match) => match.toUpperCase()) // Capitalize first letter
      .trim();
  },

  /**
   * Get initials from name
   * @param {string} name - Full name
   * @param {number} maxInitials - Maximum number of initials
   * @returns {string} Initials
   */
  getInitials: (name, maxInitials = 2) => {
    if (!name || typeof name !== 'string') return '';
    
    const words = name.trim().split(/\s+/);
    const initials = words
      .slice(0, maxInitials)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    
    return initials;
  },

  /**
   * Highlight search terms in text
   * @param {string} text - Text to highlight
   * @param {string} searchTerm - Term to highlight
   * @param {string} className - CSS class for highlighting
   * @returns {string} HTML string with highlighted terms
   */
  highlight: (text, searchTerm, className = 'bg-yellow-200') => {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, `<span class="${className}">$1</span>`);
  },

  /**
   * Clean HTML tags from text
   * @param {string} html - HTML string
   * @returns {string} Clean text
   */
  stripHtml: (html) => {
    if (!html || typeof html !== 'string') return '';
    
    return html.replace(/<[^>]*>/g, '');
  },

  /**
   * Format file size
   * @param {number} bytes - File size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted file size
   */
  fileSize: (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
};

/**
 * Array and object formatting utilities
 */
export const dataFormatters = {
  /**
   * Format array as comma-separated list
   * @param {Array} arr - Array to format
   * @param {string} conjunction - Conjunction word ('and', 'or')
   * @param {number} maxItems - Maximum items to show before truncating
   * @returns {string} Formatted list
   */
  asListString: (arr, conjunction = 'and', maxItems = 3) => {
    if (!Array.isArray(arr) || arr.length === 0) return '';
    
    if (arr.length === 1) return arr[0].toString();
    
    if (arr.length <= maxItems) {
      if (arr.length === 2) {
        return `${arr[0]} ${conjunction} ${arr[1]}`;
      }
      
      const lastItem = arr[arr.length - 1];
      const otherItems = arr.slice(0, -1);
      return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
    }
    
    const visibleItems = arr.slice(0, maxItems);
    const remainingCount = arr.length - maxItems;
    return `${visibleItems.join(', ')}, ${conjunction} ${remainingCount} more`;
  },

  /**
   * Format object as key-value pairs
   * @param {Object} obj - Object to format
   * @param {string} separator - Separator between key and value
   * @param {string} delimiter - Delimiter between pairs
   * @returns {string} Formatted string
   */
  objectToString: (obj, separator = ': ', delimiter = ', ') => {
    if (!obj || typeof obj !== 'object') return '';
    
    return Object.entries(obj)
      .map(([key, value]) => `${textFormatters.toReadable(key)}${separator}${value}`)
      .join(delimiter);
  },

  /**
   * Sort and format leaderboard data
   * @param {Array} data - Array of leaderboard entries
   * @param {string} sortBy - Sort criteria
   * @returns {Array} Sorted and formatted data
   */
  leaderboardData: (data, sortBy = 'score') => {
    if (!Array.isArray(data)) return [];
    
    const sorted = [...data].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'name':
          return a.userName.localeCompare(b.userName);
        case 'time':
          return (a.timeTaken?.totalMilliseconds || 0) - (b.timeTaken?.totalMilliseconds || 0);
        default:
          return 0;
      }
    });
    
    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      formattedScore: numberFormatters.asPercentage(entry.score || 0),
      formattedTime: timeFormatters.fromTimeSpan(entry.timeTaken),
      performance: numberFormatters.scoreWithStyle(entry.score || 0)
    }));
  }
};

/**
 * Quiz-specific formatting utilities
 */
export const quizFormatters = {
  /**
   * Format quiz duration for display
   * @param {number} minutes - Duration in minutes
   * @returns {string} Formatted duration
   */
  duration: (minutes) => {
    if (!minutes || minutes <= 0) return 'No time limit';
    
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  },

  /**
   * Format question type for display
   * @param {string} type - Question type
   * @returns {string} Formatted type
   */
  questionType: (type) => {
    const typeMap = {
      'MultipleChoice': 'Multiple Choice',
      'TrueFalse': 'True/False',
      'ShortAnswer': 'Short Answer',
      'Essay': 'Essay',
      'FillInTheBlank': 'Fill in the Blank'
    };
    
    return typeMap[type] || textFormatters.toReadable(type);
  },

  /**
   * Format quiz status
   * @param {boolean} isActive - Whether quiz is active
   * @param {Date} createdAt - Quiz creation date
   * @returns {Object} Status information
   */
  status: (isActive, createdAt) => {
    const status = {
      text: isActive ? 'Active' : 'Inactive',
      color: isActive ? 'green' : 'gray',
      class: isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
    };
    
    if (createdAt && dateFormatters.isToday(createdAt)) {
      status.text = isActive ? 'Active (New)' : 'Inactive (New)';
    }
    
    return status;
  },

  /**
   * Format answer options for display
   * @param {Array} options - Array of answer options
   * @param {string} correctAnswer - Correct answer
   * @returns {Array} Formatted options with metadata
   */
  answerOptions: (options, correctAnswer = null) => {
    if (!Array.isArray(options)) return [];
    
    return options.map((option, index) => ({
      text: option,
      letter: String.fromCharCode(65 + index), // A, B, C, D...
      isCorrect: correctAnswer ? option === correctAnswer : false,
      index
    }));
  }
};

/**
 * Export data formatting utilities
 */
export const exportFormatters = {
  /**
   * Format data for CSV export
   * @param {Array} data - Data to export
   * @param {Array} columns - Column definitions
   * @returns {string} CSV string
   */
  toCSV: (data, columns) => {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const headers = columns.map(col => col.header || col.key);
    const rows = data.map(row => 
      columns.map(col => {
        let value = row[col.key];
        
        // Apply formatter if provided
        if (col.formatter) {
          value = col.formatter(value, row);
        }
        
        // Escape CSV special characters
        if (typeof value === 'string') {
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
        }
        
        return value || '';
      })
    );
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  },

  /**
   * Format data for JSON export
   * @param {Array} data - Data to export
   * @param {boolean} pretty - Whether to format JSON nicely
   * @returns {string} JSON string
   */
  toJSON: (data, pretty = true) => {
    return JSON.stringify(data, null, pretty ? 2 : 0);
  },

  /**
   * Generate filename for export
   * @param {string} prefix - Filename prefix
   * @param {string} extension - File extension
   * @param {Date} date - Date for filename (default: current date)
   * @returns {string} Generated filename
   */
  generateFilename: (prefix, extension, date = new Date()) => {
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    return `${prefix}-${dateStr}-${timeStr}.${extension}`;
  }
};

/**
 * Validation formatting utilities
 */
export const validationFormatters = {
  /**
   * Format validation errors for display
   * @param {Array|Object} errors - Validation errors
   * @returns {Array} Formatted error messages
   */
  errors: (errors) => {
    if (!errors) return [];
    
    if (Array.isArray(errors)) {
      return errors.map(error => ({
        message: error.message || error,
        field: error.field || null,
        type: error.type || 'error'
      }));
    }
    
    if (typeof errors === 'object') {
      return Object.entries(errors).map(([field, message]) => ({
        message: Array.isArray(message) ? message[0] : message,
        field,
        type: 'error'
      }));
    }
    
    return [{ message: errors.toString(), field: null, type: 'error' }];
  },

  /**
   * Format form field for display
   * @param {string} fieldName - Field name
   * @returns {string} Formatted field name
   */
  fieldName: (fieldName) => {
    return textFormatters.toReadable(fieldName);
  }
};

// Default export with all formatters
export default {
  time: timeFormatters,
  date: dateFormatters,
  number: numberFormatters,
  text: textFormatters,
  data: dataFormatters,
  quiz: quizFormatters,
  export: exportFormatters,
  validation: validationFormatters
};