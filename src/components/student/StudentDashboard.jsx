// src/components/student/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import Layout from '../common/Layout';
import { 
  Play, 
  Clock, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  CheckCircle, 
  Award,
  Target,
  Calendar,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch available quizzes
        const quizzesResponse = await apiService.quiz.getAll(token);
        if (quizzesResponse.success) {
          setQuizzes(quizzesResponse.data);
        }

        // Fetch user stats
        try {
          const statsResponse = await apiService.leaderboard.getMyStats(token);
          if (statsResponse.success) {
            setMyStats(statsResponse.data);
          }
        } catch (error) {
          console.log('Stats not available yet');
        }

        // Fetch recent results
        try {
          const resultsResponse = await apiService.result.getMyResults(token);
          if (resultsResponse.success) {
            setRecentResults(resultsResponse.data.slice(0, 5));
          }
        } catch (error) {
          console.log('Results not available yet');
        }

      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleStartQuiz = async (quizId) => {
    try {
      // Check if user has already attempted this quiz
      const attemptResponse = await apiService.result.checkAttempt(quizId, token);
      
      if (attemptResponse.success && attemptResponse.data) {
        toast.error('You have already completed this quiz');
        return;
      }
      
      navigate(`/student/quiz/${quizId}`);
    } catch (error) {
      toast.error('Failed to start quiz');
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatTime = (timeSpan) => {
    if (!timeSpan) return 'N/A';
    const totalMinutes = Math.floor(timeSpan.totalMilliseconds / 60000);
    const seconds = Math.floor((timeSpan.totalMilliseconds % 60000) / 1000);
    return `${totalMinutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 🎓</h1>
          <p className="text-indigo-100">Ready to challenge yourself with some quizzes?</p>
        </div>

        {/* Stats Cards */}
        {myStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Quizzes Attempted</p>
                  <p className="text-2xl font-bold text-gray-900">{myStats.totalQuizzesAttempted}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{myStats.averageScore.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Best Score</p>
                  <p className="text-2xl font-bold text-gray-900">{myStats.bestScore.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{myStats.accuracyRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Quizzes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Play className="w-6 h-6 mr-2 text-indigo-600" />
                Available Quizzes
              </h2>
            </div>

            <div className="space-y-4">
              {quizzes.length > 0 ? (
                quizzes.slice(0, 5).map((quiz) => (
                  <div key={quiz.quizId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="mr-4">{quiz.duration} minutes</span>
                          <BookOpen className="w-4 h-4 mr-1" />
                          <span className="mr-4">{quiz.questionCount} questions</span>
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartQuiz(quiz.quizId)}
                        className="ml-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No quizzes available at the moment</p>
                </div>
              )}
            </div>

            {quizzes.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/student/quizzes')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View all quizzes →
                </button>
              </div>
            )}
          </div>

          {/* Recent Results */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                Recent Results
              </h2>
              {recentResults.length > 0 && (
                <button
                  onClick={() => navigate('/student/results')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                >
                  View all →
                </button>
              )}
            </div>

            <div className="space-y-4">
              {recentResults.length > 0 ? (
                recentResults.map((result) => (
                  <div key={result.resultId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{result.quizTitle}</h3>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                          <span className="mr-4">{result.correctAnswers}/{result.totalQuestions} correct</span>
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{formatTime(result.timeTaken)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(result.score)}`}>
                          {result.score.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(result.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No quiz results yet</p>
                  <p className="text-sm mt-1">Complete some quizzes to see your results here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/student/results')}
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">View Results</div>
                <div className="text-sm text-gray-600">Check your quiz performance</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/student/leaderboard')}
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Trophy className="w-8 h-8 text-green-600 mr-3" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Leaderboard</div>
                <div className="text-sm text-gray-600">See how you rank</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/student/profile')}
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <Users className="w-8 h-8 text-purple-600 mr-3" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">My Profile</div>
                <div className="text-sm text-gray-600">View your statistics</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;