// src/components/admin/AdminResults.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import Layout from '../common/Layout';
import { 
  BarChart3, 
  Users, 
  Trophy, 
  TrendingUp, 
  Download,
  Filter,
  Search,
  Calendar,
  Clock,
  Target,
  Award,
  Eye,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminResults = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    passRate: 0,
    totalStudents: 0
  });

  const { token } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedQuiz !== 'all') {
      fetchQuizResults(selectedQuiz);
    } else {
      setResults([]);
      setFilteredResults([]);
    }
  }, [selectedQuiz]);

  useEffect(() => {
    filterAndSortResults();
  }, [results, searchTerm, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin's quizzes
      const quizzesResponse = await apiService.quiz.getMyQuizzes(token);
      if (quizzesResponse.success) {
        setQuizzes(quizzesResponse.data);
        
        // If we have quizzes, select the first one by default
        if (quizzesResponse.data.length > 0) {
          setSelectedQuiz(quizzesResponse.data[0].quizId.toString());
        }
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizResults = async (quizId) => {
    try {
      const response = await apiService.result.getQuizResults(quizId, token);
      
      if (response.success) {
        setResults(response.data);
        calculateStats(response.data);
      } else {
        setResults([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Failed to fetch quiz results:', error);
      setResults([]);
      calculateStats([]);
    }
  };

  const calculateStats = (resultsData) => {
    if (resultsData.length === 0) {
      setStats({
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        totalStudents: 0
      });
      return;
    }

    const totalAttempts = resultsData.length;
    const averageScore = resultsData.reduce((sum, result) => sum + result.score, 0) / totalAttempts;
    const passCount = resultsData.filter(result => result.score >= 60).length;
    const passRate = (passCount / totalAttempts) * 100;
    const uniqueStudents = new Set(resultsData.map(result => result.userId)).size;

    setStats({
      totalAttempts,
      averageScore,
      passRate,
      totalStudents: uniqueStudents
    });
  };

  const filterAndSortResults = () => {
    let filtered = results;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'name':
          return a.userName.localeCompare(b.userName);
        case 'time':
          return (a.timeTaken?.totalMilliseconds || 0) - (b.timeTaken?.totalMilliseconds || 0);
        case 'date':
        default:
          return new Date(b.submittedAt) - new Date(a.submittedAt);
      }
    });

    setFilteredResults(filtered);
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Pass';
    return 'Needs Improvement';
  };

  const formatTime = (timeSpan) => {
    if (!timeSpan) return 'N/A';
    const totalMinutes = Math.floor(timeSpan.totalMilliseconds / 60000);
    const seconds = Math.floor((timeSpan.totalMilliseconds % 60000) / 1000);
    return `${totalMinutes}m ${seconds}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportResults = () => {
    if (filteredResults.length === 0) {
      toast.error('No results to export');
      return;
    }

    const csvContent = [
      ['Student Name', 'Quiz Title', 'Score (%)', 'Correct Answers', 'Total Questions', 'Time Taken', 'Submitted At', 'Performance Level'].join(','),
      ...filteredResults.map(result => [
        result.userName,
        result.quizTitle,
        result.score.toFixed(1),
        result.correctAnswers,
        result.totalQuestions,
        formatTime(result.timeTaken),
        formatDate(result.submittedAt),
        getPerformanceLabel(result.score)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-results-${selectedQuiz}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Results exported successfully');
  };

  const selectedQuizData = quizzes.find(q => q.quizId.toString() === selectedQuiz);

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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Quiz Results & Analytics 📊</h1>
          <p className="text-blue-100">Monitor student performance and quiz effectiveness</p>
        </div>

        {/* Quiz Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Select Quiz:</span>
              
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-64"
              >
                <option value="all">All Quizzes</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.quizId} value={quiz.quizId.toString()}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedQuiz !== 'all' && filteredResults.length > 0 && (
              <button
                onClick={exportResults}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {selectedQuiz !== 'all' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.passRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unique Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz Info */}
            {selectedQuizData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Quiz Title</p>
                    <p className="font-semibold text-gray-900">{selectedQuizData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{selectedQuizData.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Questions</p>
                    <p className="font-semibold text-gray-900">{selectedQuizData.questionCount}</p>
                  </div>
                </div>
                {selectedQuizData.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-900">{selectedQuizData.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by student name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div className="sm:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="score">Sort by Score</option>
                    <option value="name">Sort by Name</option>
                    <option value="time">Sort by Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {filteredResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Performance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Answers
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time Taken
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredResults.map((result, index) => (
                        <tr key={result.resultId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {result.userName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {result.userName}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-2xl font-bold text-gray-900 mr-2">
                                {result.score.toFixed(1)}%
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(result.score)}`}>
                                {getPerformanceLabel(result.score)}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                <span className="text-sm font-medium">{result.correctAnswers}</span>
                              </div>
                              <div className="flex items-center text-red-600">
                                <XCircle className="w-4 h-4 mr-1" />
                                <span className="text-sm font-medium">{result.totalQuestions - result.correctAnswers}</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                / {result.totalQuestions}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              {formatTime(result.timeTaken)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                              {formatDate(result.submittedAt)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              result.score >= 60 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.score >= 60 ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Passed
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Failed
                                </>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedQuiz === 'all' ? 'Select a quiz to view results' : 'No results found'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? 'Try adjusting your search criteria'
                      : selectedQuiz === 'all' 
                        ? 'Choose a specific quiz from the dropdown above'
                        : 'No students have completed this quiz yet'
                    }
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {selectedQuiz === 'all' && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Filter className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Quiz</h3>
            <p className="text-gray-600 mb-6">
              Choose a specific quiz from the dropdown above to view detailed results and analytics.
            </p>
            {quizzes.length === 0 && (
              <p className="text-gray-500 mt-4">
                No quizzes found. Create some quizzes first to see results here.
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminResults;