// src/services/apiService.js - Updated Version
const API_BASE_URL = 'https://localhost:7200/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Build headers properly
    const headers = {};
    
    // Add authorization header if provided
    if (options.headers && options.headers.Authorization) {
      headers.Authorization = options.headers.Authorization;
    }
    
    // Only add Content-Type for requests with body
    if (options.body && ['POST', 'PUT', 'PATCH'].includes((options.method || 'GET').toUpperCase())) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    }
    
    // Add any other custom headers
    if (options.headers) {
      Object.keys(options.headers).forEach(key => {
        if (key !== 'Authorization') {
          headers[key] = options.headers[key];
        }
      });
    }

    const config = {
      method: options.method || 'GET',
      headers,
      mode: 'cors',
      credentials: 'omit'
    };
    
    // Only add body for methods that support it
    if (options.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
      config.body = options.body;
    }

    console.log('Making API request:', {
      url,
      method: config.method,
      headers: config.headers,
      bodyPresent: !!config.body
    });

    try {
      const response = await fetch(url, config);
      
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('JSON response data:', data);
      } else {
        const text = await response.text();
        console.log('Non-JSON response:', text);
        
        // Try to parse error responses that might be in different formats
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = { message: text };
          }
        } else {
          data = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
      }
      
      if (response.ok) {
        // Handle successful responses
        return {
          success: true,
          data: data.data || data,
          message: data.message || 'Success'
        };
      } else {
        // Handle error responses
        console.error('API Error Response:', data);
        return {
          success: false,
          data: null,
          message: data.message || data.title || `HTTP ${response.status}: ${response.statusText}`,
          error: data.message || data.title || `Request failed with status ${response.status}`
        };
      }
    } catch (error) {
      console.error('API Request failed with exception:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Network error occurred',
        error: error.message || 'Network error occurred'
      };
    }
  }

  setAuthHeader(token) {
    if (!token) {
      console.warn('No token provided for authentication');
      return {};
    }
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  // Authentication endpoints
  auth = {
    login: (credentials) => {
      console.log('Attempting login for:', credentials.email);
      return this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    register: (userData) => {
      console.log('Attempting registration for:', userData.email);
      return this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
  };

  // Quiz endpoints
  quiz = {
    getAll: (token) => {
      return this.request('/quiz', {
        headers: this.setAuthHeader(token),
      });
    },

    getMyQuizzes: (token) => {
      return this.request('/quiz/my-quizzes', {
        headers: this.setAuthHeader(token),
      });
    },

    getById: (id, token) => {
      return this.request(`/quiz/${id}`, {
        headers: this.setAuthHeader(token),
      });
    },

    create: (quizData, token) => {
      console.log('Creating quiz with data:', quizData);
      
      // Validate required fields
      if (!quizData.title || !quizData.duration) {
        throw new Error('Title and duration are required');
      }
      
      return this.request('/quiz', {
        method: 'POST',
        headers: this.setAuthHeader(token),
        body: JSON.stringify(quizData),
      });
    },

    update: (id, quizData, token) => {
      console.log('Updating quiz:', id, 'with data:', quizData);
      return this.request(`/quiz/${id}`, {
        method: 'PUT',
        headers: this.setAuthHeader(token),
        body: JSON.stringify(quizData),
      });
    },

    delete: (id, token) => {
      console.log('Deleting quiz:', id);
      return this.request(`/quiz/${id}`, {
        method: 'DELETE',
        headers: this.setAuthHeader(token),
      });
    },

    submit: (quizId, answers, token) => {
      console.log('Submitting quiz:', quizId, 'with answers:', answers);
      
      // Validate submission data
      if (!answers.answers || !Array.isArray(answers.answers)) {
        throw new Error('Invalid answer format');
      }
      
      return this.request(`/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: this.setAuthHeader(token),
        body: JSON.stringify(answers),
      });
    },
  };

  // Question endpoints
  question = {
    create: (quizId, questionData, token) => {
      console.log('Creating question for quiz:', quizId, 'with data:', questionData);
      return this.request(`/quiz/${quizId}/question`, {
        method: 'POST',
        headers: this.setAuthHeader(token),
        body: JSON.stringify(questionData),
      });
    },

    update: (quizId, questionId, questionData, token) => {
      console.log('Updating question:', questionId, 'in quiz:', quizId);
      return this.request(`/quiz/${quizId}/question/${questionId}`, {
        method: 'PUT',
        headers: this.setAuthHeader(token),
        body: JSON.stringify(questionData),
      });
    },

    delete: (quizId, questionId, token) => {
      console.log('Deleting question:', questionId, 'from quiz:', quizId);
      return this.request(`/quiz/${quizId}/question/${questionId}`, {
        method: 'DELETE',
        headers: this.setAuthHeader(token),
      });
    },
  };

  // Result endpoints
  result = {
    getMyResults: (token) => {
      return this.request('/result/my-results', {
        headers: this.setAuthHeader(token),
      });
    },

    getQuizResults: (quizId, token) => {
      return this.request(`/result/quiz/${quizId}`, {
        headers: this.setAuthHeader(token),
      });
    },

    getMyQuizResult: (quizId, token) => {
      return this.request(`/result/quiz/${quizId}/my-result`, {
        headers: this.setAuthHeader(token),
      });
    },

    getDetailedResult: (quizId, token) => {
      return this.request(`/result/quiz/${quizId}/my-result/detailed`, {
        headers: this.setAuthHeader(token),
      });
    },

    checkAttempt: (quizId, token) => {
      return this.request(`/result/quiz/${quizId}/check-attempt`, {
        headers: this.setAuthHeader(token),
      });
    },
  };

  // Leaderboard endpoints
  leaderboard = {
    getQuizLeaderboard: (quizId, topCount = 10, token) => {
      return this.request(`/leaderboard/quiz/${quizId}?topCount=${topCount}`, {
        headers: this.setAuthHeader(token),
      });
    },

    getGlobalLeaderboard: (topCount = 10, token) => {
      return this.request(`/leaderboard/global?topCount=${topCount}`, {
        headers: this.setAuthHeader(token),
      });
    },

    getQuizPodium: (quizId, token) => {
      return this.request(`/leaderboard/quiz/${quizId}/podium`, {
        headers: this.setAuthHeader(token),
      });
    },

    getMyStats: (token) => {
      return this.request('/leaderboard/user/stats', {
        headers: this.setAuthHeader(token),
      });
    },

    getUserStats: (userId, token) => {
      return this.request(`/leaderboard/user/${userId}/stats`, {
        headers: this.setAuthHeader(token),
      });
    },

    getUserRank: (userId, quizId, token) => {
      return this.request(`/leaderboard/user/${userId}/rank/quiz/${quizId}`, {
        headers: this.setAuthHeader(token),
      });
    },
  };
}

export const apiService = new ApiService();