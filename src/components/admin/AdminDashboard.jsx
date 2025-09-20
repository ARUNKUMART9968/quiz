// src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import Layout from '../common/Layout';
import { 
  Plus, 
  BookOpen, 
  Users, 
  Trophy, 
  TrendingUp, 
  Edit, 
  Eye,
  Trash2,
  BarChart3,
  Calendar,
  Clock,
  Target,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalStudents: 0,
    totalAttempts: 0,
    averageScore: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch admin's quizzes
        const quizzesResponse = await apiService.quiz.getMyQuizzes(token);
        if (quizzesResponse.success) {
          setMyQuizzes(quizzesResponse.data);
          
          // Update stats
          setStats(prev => ({
            ...prev,
            totalQuizzes: quizzesResponse.data.length
          }));
        }

        // Try to fetch global leaderboard for additional stats
        try {
          const leaderboardResponse = await apiService.leaderboard.getGlobalLeaderboard(10, token);
          if (leaderboardResponse.success) {
            const data = leaderboardResponse.data;
            setStats(prev => ({
              ...prev,
              totalStudents: data.totalStudents,
              averageScore: data.overallAverageScore
            }));
          }
        } catch (error) {
          console.log('Leaderboard data not available');
        }

      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const handleCreateQuiz = () => {
    navigate('/admin/quizzes');
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/admin/quiz/${quizId}/questions`);
  };

  const handleViewResults = (quizId) => {
    navigate(`/admin/results?quizId=${quizId}`);
  };

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiService.quiz.delete(quizId, token);
      
      if (response.success) {
        toast.success('Quiz deleted successfully');
        setMyQuizzes(prev => prev.filter(quiz => quiz.quizId !== quizId));
        setStats(prev => ({
          ...prev,
          totalQuizzes: prev.totalQuizzes - 1
        }));
      } else {
        toast.error('Failed to delete quiz');
      }
    } catch (error) {
      toast.error('Failed to delete quiz');
      console.error('Delete error:', error);
    }
  };

  const getQuizStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👨‍🏫</h1>
          <p className="text-purple-100">Manage your quizzes and track student performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myQuizzes.filter(q => q.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Quizzes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-purple-600" />
                My Quizzes
              </h2>
              <button
                onClick={handleCreateQuiz}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {myQuizzes.length > 0 ? (
                myQuizzes.map((quiz) => (
                  <div key={quiz.quizId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-gray-900 mr-3">{quiz.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getQuizStatusColor(quiz.isActive)}`}>
                            {quiz.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                        
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{quiz.duration} min</span>
                          </div>
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            <span>{quiz.questionCount} questions</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(quiz.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleViewResults(quiz.quizId)}
                          className="text-blue-600 hover:text-blue-900"
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No quiz activity yet</p>
              <p className="text-sm mt-1">Create some quizzes to see activity here</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;={() => handleViewResults(quiz.quizId)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Results"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEditQuiz(quiz.quizId)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Quiz"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteQuiz(quiz.quizId, quiz.title)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No quizzes created yet</p>
                  <button
                    onClick={handleCreateQuiz}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Create your first quiz →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-indigo-600" />
              Quick Actions
            </h2>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/admin/quizzes')}
                className="w-full flex items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-lg transition-all duration-200 border border-purple-200"
              >
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <Plus className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Create New Quiz</div>
                  <div className="text-sm text-gray-600">Start building a new quiz for students</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/results')}
                className="w-full flex items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-lg transition-all duration-200 border border-blue-200"
              >
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">View All Results</div>
                  <div className="text-sm text-gray-600">Analyze student performance</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/leaderboard')}
                className="w-full flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-all duration-200 border border-green-200"
              >
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Leaderboard</div>
                  <div className="text-sm text-gray-600">Check top performing students</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/analytics')}
                className="w-full flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg transition-all duration-200 border border-orange-200"
              >
                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Analytics</div>
                  <div className="text-sm text-gray-600">Deep dive into quiz analytics</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
            Recent Quiz Activity
          </h2>

          {myQuizzes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myQuizzes.slice(0, 5).map((quiz) => (
                    <tr key={quiz.quizId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{quiz.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getQuizStatusColor(quiz.isActive)}`}>
                          {quiz.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quiz.questionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quiz.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(quiz.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditQuiz(quiz.quizId)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick