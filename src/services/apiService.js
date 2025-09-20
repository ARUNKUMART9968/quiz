// src/services/apiService.js
const API_BASE_URL = 'https://localhost:7000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  setAuthHeader(token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  // Authentication endpoints
  auth = {
    login: (credentials) => this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

    register: (userData) => this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  };

  // Quiz endpoints
  quiz = {
    getAll: (token) => this.request('/quiz', {
      headers: this.setAuthHeader(token),
    }),

    getMyQuizzes: (token) => this.request('/quiz/my-quizzes', {
      headers: this.setAuthHeader(token),
    }),

    getById: (id, token) => this.request(`/quiz/${id}`, {
      headers: this.setAuthHeader(token),
    }),

    create: (quizData, token) => this.request('/quiz', {
      method: 'POST',
      headers: this.setAuthHeader(token),
      body: JSON.stringify(quizData),
    }),

    update: (id, quizData, token) => this.request(`/quiz/${id}`, {
      method: 'PUT',
      headers: this.setAuthHeader(token),
      body: JSON.stringify(quizData),
    }),

    delete: (id, token) => this.request(`/quiz/${id}`, {
      method: 'DELETE',
      headers: this.setAuthHeader(token),
    }),

    submit: (quizId, answers, token) => this.request(`/quiz/${quizId}/submit`, {
      method: 'POST',
      headers: this.setAuthHeader(token),
      body: JSON.stringify(answers),
    }),
  };

  // Question endpoints
  question = {
    create: (quizId, questionData, token) => this.request(`/quiz/${quizId}/question`, {
      method: 'POST',
      headers: this.setAuthHeader(token),
      body: JSON.stringify(questionData),
    }),

    update: (quizId, questionId, questionData, token) => this.request(`/quiz/${quizId}/question/${questionId}`, {
      method: 'PUT',
      headers: this.setAuthHeader(token),
      body: JSON.stringify(questionData),
    }),

    delete: (quizId, questionId, token) => this.request(`/quiz/${quizId}/question/${questionId}`, {
      method: 'DELETE',
      headers: this.setAuthHeader(token),
    }),
  };

  // Result endpoints
  result = {
    getMyResults: (token) => this.request('/result/my-results', {
      headers: this.setAuthHeader(token),
    }),

    getQuizResults: (quizId, token) => this.request(`/result/quiz/${quizId}`, {
      headers: this.setAuthHeader(token),
    }),

    getMyQuizResult: (quizId, token) => this.request(`/result/quiz/${quizId}/my-result`, {
      headers: this.setAuthHeader(token),
    }),

    getDetailedResult: (quizId, token) => this.request(`/result/quiz/${quizId}/my-result/detailed`, {
      headers: this.setAuthHeader(token),
    }),

    checkAttempt: (quizId, token) => this.request(`/result/quiz/${quizId}/check-attempt`, {
      headers: this.setAuthHeader(token),
    }),
  };

  // Leaderboard endpoints
  leaderboard = {
    getQuizLeaderboard: (quizId, topCount = 10, token) => this.request(`/leaderboard/quiz/${quizId}?topCount=${topCount}`, {
      headers: this.setAuthHeader(token),
    }),

    getGlobalLeaderboard: (topCount = 10, token) => this.request(`/leaderboard/global?topCount=${topCount}`, {
      headers: this.setAuthHeader(token),
    }),

    getQuizPodium: (quizId, token) => this.request(`/leaderboard/quiz/${quizId}/podium`, {
      headers: this.setAuthHeader(token),
    }),

    getMyStats: (token) => this.request('/leaderboard/user/stats', {
      headers: this.setAuthHeader(token),
    }),

    getUserStats: (userId, token) => this.request(`/leaderboard/user/${userId}/stats`, {
      headers: this.setAuthHeader(token),
    }),

    getUserRank: (userId, quizId, token) => this.request(`/leaderboard/user/${userId}/rank/quiz/${quizId}`, {
      headers: this.setAuthHeader(token),
    }),
  };
}

export const apiService = new ApiService();