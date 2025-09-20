// src/utils/constants.js

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://localhost:7000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'quiz_app_token',
  USER_KEY: 'quiz_app_user',
  REFRESH_TOKEN_KEY: 'quiz_app_refresh_token',
  SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  STUDENT: 'Student',
};

// Quiz Configuration
export const QUIZ_CONFIG = {
  MIN_DURATION: 1, // minutes
  MAX_DURATION: 300, // minutes
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 100,
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 6,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  WARNING_TIME_LEFT: 300000, // 5 minutes in milliseconds
};

// Question Types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'MultipleChoice',
  TRUE_FALSE: 'TrueFalse',
  SHORT_ANSWER: 'ShortAnswer', // For future implementation
  ESSAY: 'Essay', // For future implementation
};

// Question Type Labels
export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Multiple Choice',
  [QUESTION_TYPES.TRUE_FALSE]: 'True/False',
  [QUESTION_TYPES.SHORT_ANSWER]: 'Short Answer',
  [QUESTION_TYPES.ESSAY]: 'Essay',
};

// Performance Levels
export const PERFORMANCE_LEVELS = {
  EXCELLENT: {
    label: 'Excellent',
    minScore: 90,
    color: 'green',
    icon: '🏆',
  },
  GOOD: {
    label: 'Good',
    minScore: 75,
    color: 'blue',
    icon: '👍',
  },
  AVERAGE: {
    label: 'Average',
    minScore: 60,
    color: 'yellow',
    icon: '📊',
  },
  BELOW_AVERAGE: {
    label: 'Below Average',
    minScore: 40,
    color: 'orange',
    icon: '📉',
  },
  POOR: {
    label: 'Poor',
    minScore: 0,
    color: 'red',
    icon: '📋',
  },
};

// UI Constants
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 10,
  MAX_ITEMS_PER_PAGE: 100,
  TOAST_DURATION: 4000, // 4 seconds
  ANIMATION_DURATION: 300, // milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds
  MOBILE_BREAKPOINT: 768, // pixels
  TABLET_BREAKPOINT: 1024, // pixels
};

// Color Schemes
export const COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
};

// Sort Options
export const SORT_OPTIONS = {
  DATE_DESC: { key: 'date', order: 'desc', label: 'Newest First' },
  DATE_ASC: { key: 'date', order: 'asc', label: 'Oldest First' },
  SCORE_DESC: { key: 'score', order: 'desc', label: 'Highest Score' },
  SCORE_ASC: { key: 'score', order: 'asc', label: 'Lowest Score' },
  NAME_ASC: { key: 'name', order: 'asc', label: 'Name A-Z' },
  NAME_DESC: { key: 'name', order: 'desc', label: 'Name Z-A' },
  TIME_ASC: { key: 'time', order: 'asc', label: 'Fastest Time' },
  TIME_DESC: { key: 'time', order: 'desc', label: 'Slowest Time' },
};

// Filter Options
export const FILTER_OPTIONS = {
  QUIZ_STATUS: {
    ALL: { value: 'all', label: 'All Status' },
    ACTIVE: { value: 'active', label: 'Active Only' },
    INACTIVE: { value: 'inactive', label: 'Inactive Only' },
  },
  PERFORMANCE: {
    ALL: { value: 'all', label: 'All Performance' },
    EXCELLENT: { value: 'excellent', label: 'Excellent (90%+)' },
    GOOD: { value: 'good', label: 'Good (75%+)' },
    AVERAGE: { value: 'average', label: 'Average (60%+)' },
    POOR: { value: 'poor', label: 'Below Average (<60%)' },
  },
  TIME_RANGE: {
    ALL: { value: 'all', label: 'All Time' },
    TODAY: { value: 'today', label: 'Today' },
    WEEK: { value: 'week', label: 'This Week' },
    MONTH: { value: 'month', label: 'This Month' },
    YEAR: { value: 'year', label: 'This Year' },
  },
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
    MESSAGE: 'Password must contain at least 6 characters with uppercase, lowercase, and number',
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
    MESSAGE: 'Name must contain only letters, spaces, hyphens, and apostrophes',
  },
  QUIZ_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 200,
    MESSAGE: 'Quiz title must be between 3 and 200 characters',
  },
  QUIZ_DESCRIPTION: {
    MAX_LENGTH: 1000,
    MESSAGE: 'Quiz description must not exceed 1000 characters',
  },
  QUESTION_TEXT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
    MESSAGE: 'Question text must be between 10 and 1000 characters',
  },
  OPTION_TEXT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
    MESSAGE: 'Option text must be between 1 and 200 characters',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  QUIZ_NOT_FOUND: 'Quiz not found or has been deleted.',
  QUESTION_NOT_FOUND: 'Question not found or has been deleted.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
  QUIZ_ALREADY_SUBMITTED: 'You have already submitted this quiz.',
  QUIZ_TIME_EXPIRED: 'Quiz time has expired.',
  INVALID_QUIZ_DATA: 'Invalid quiz data. Please check all fields.',
  PERMISSION_DENIED: 'You do not have permission to access this resource.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back! You have successfully logged in.',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
  REGISTER_SUCCESS: 'Account created successfully! Welcome to QuizMaster.',
  QUIZ_CREATED: 'Quiz created successfully!',
  QUIZ_UPDATED: 'Quiz updated successfully!',
  QUIZ_DELETED: 'Quiz deleted successfully!',
  QUESTION_CREATED: 'Question added successfully!',
  QUESTION_UPDATED: 'Question updated successfully!',
  QUESTION_DELETED: 'Question deleted successfully!',
  QUIZ_SUBMITTED: 'Quiz submitted successfully!',
  DATA_EXPORTED: 'Data exported successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// Loading Messages
export const LOADING_MESSAGES = {
  LOGGING_IN: 'Signing you in...',
  REGISTERING: 'Creating your account...',
  LOADING_QUIZZES: 'Loading quizzes...',
  LOADING_QUESTIONS: 'Loading questions...',
  LOADING_RESULTS: 'Loading results...',
  LOADING_LEADERBOARD: 'Loading leaderboard...',
  SUBMITTING_QUIZ: 'Submitting your answers...',
  SAVING_CHANGES: 'Saving changes...',
  DELETING: 'Deleting...',
  EXPORTING: 'Exporting data...',
  UPLOADING: 'Uploading...',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  STUDENT_DASHBOARD: '/student',
  STUDENT_QUIZ: '/student/quiz/:id',
  STUDENT_RESULTS: '/student/results',
  STUDENT_LEADERBOARD: '/student/leaderboard',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_QUIZZES: '/admin/quizzes',
  ADMIN_QUESTIONS: '/admin/quiz/:id/questions',
  ADMIN_RESULTS: '/admin/results',
  ADMIN_LEADERBOARD: '/admin/leaderboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'quiz_app_theme',
  LANGUAGE: 'quiz_app_language',
  PREFERENCES: 'quiz_app_preferences',
  DRAFT_ANSWERS: 'quiz_app_draft_answers',
  LAST_VISITED: 'quiz_app_last_visited',
  SIDEBAR_COLLAPSED: 'quiz_app_sidebar_collapsed',
};

// Theme Configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

// Date/Time Formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
};

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Quiz Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: {
    value: 'easy',
    label: 'Easy',
    color: 'green',
    icon: '😊',
  },
  MEDIUM: {
    value: 'medium',
    label: 'Medium',
    color: 'yellow',
    icon: '😐',
  },
  HARD: {
    value: 'hard',
    label: 'Hard',
    color: 'red',
    icon: '😰',
  },
};

// Export default config object
export default {
  API_CONFIG,
  AUTH_CONFIG,
  USER_ROLES,
  QUIZ_CONFIG,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  PERFORMANCE_LEVELS,
  UI_CONFIG,
  COLORS,
  SORT_OPTIONS,
  FILTER_OPTIONS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  ROUTES,
  STORAGE_KEYS,
  THEME_CONFIG,
  FILE_CONFIG,
  DATE_FORMATS,
  BREAKPOINTS,
  DIFFICULTY_LEVELS,
};