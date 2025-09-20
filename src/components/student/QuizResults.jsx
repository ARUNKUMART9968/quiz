// src/components/student/QuizResults.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import Layout from '../common/Layout';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Award,
  Filter,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuizResults = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, score, title
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailedResult, setDetailedResult] = useState(null);

  const { token } = useAuth();

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    filterAndSortResults();
  }, [results, searchTerm, sortBy]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await apiService.result.getMyResults(token);
      
      if (response.success) {
        setResults(response.data);
      } else {
        toast.error('Failed to fetch results');
      }
    } catch (error) {
      toast.error('Failed to fetch results');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortResults = () => {
    let filtered = results;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'title':
          return a.quizTitle.localeCompare(b.quizTitle);
        case 'date':
        default:
          return new Date(b.submittedAt) - new Date(a.submittedAt);
      }
    });

    setFilteredResults(filtered);
  };

  const fetchDetailedResult = async (quizId) => {
    try {
      const response = await apiService.result.getDetailedResult(quizId, token);
      
      if (response.success) {
        setDetailedResult(response.data);
        setShowDetailModal(true);
      } else {
        toast.error('Failed to fetch detailed results');
      }
    } catch (error) {
      toast.error('Failed to fetch detailed results');
      console.error('Detailed result error:', error);
    }
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
    if (score >= 60) return 'Average';
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

  const calculateStats = () => {
    if (results.length === 0) return { avg: 0, best: 0, total: 0 };
    
    const scores = results.map(r => r.score);
    return {
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      best: Math.max(...scores),
      total: results.length
    };
  };

  const stats = calculateStats();

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
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">My Quiz Results 📊</h1>
          <p className="text-green-100">Track your quiz performance and progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avg.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Best Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.best.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quizzes Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

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
                  placeholder="Search by quiz title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredResults.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <div key={result.resultId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 mr-4">
                          {result.quizTitle}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(result.score)}`}>
                          {result.score.toFixed(1)}% - {getPerformanceLabel(result.score)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          <span>{result.correctAnswers}/{result.totalQuestions} Correct</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{formatTime(result.timeTaken)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                          <span>{formatDate(result.submittedAt)}</span>
                        </div>

                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-2 text-orange-500" />
                          <span>{((result.correctAnswers / result.totalQuestions) * 100).toFixed(0)}% Accuracy</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={() => fetchDetailedResult(result.quizId)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Score Progress</span>
                      <span>{result.score.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${result.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No results found' : 'No quiz results yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Complete some quizzes to see your results here'
                }
              </p>
            </div>
          )}
        </div>

        {/* Detailed Result Modal */}
        {showDetailModal && detailedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-90vh overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{detailedResult.quizTitle}</h2>
                    <p className="text-gray-600">Detailed Quiz Results</p>
                  </div>
                  
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{detailedResult.score.toFixed(1)}%</div>
                    <div className="text-sm text-blue-800">Final Score</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{detailedResult.correctAnswers}</div>
                    <div className="text-sm text-green-800">Correct Answers</div>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{detailedResult.totalQuestions - detailedResult.correctAnswers}</div>
                    <div className="text-sm text-red-800">Wrong Answers</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{formatTime(detailedResult.timeTaken)}</div>
                    <div className="text-sm text-purple-800">Time Taken</div>
                  </div>
                </div>
              </div>

              {/* Question by Question Results */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Question by Question Results</h3>
                <div className="space-y-4">
                  {detailedResult.answerDetails.map((answer, index) => (
                    <div key={answer.questionId} className={`p-4 rounded-lg border-2 ${
                      answer.isCorrect 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          Question {index + 1}
                        </h4>
                        <div className={`flex items-center px-2 py-1 rounded-full text-sm ${
                          answer.isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {answer.isCorrect ? (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-1" />
                          )}
                          {answer.isCorrect ? 'Correct' : 'Incorrect'}
                        </div>
                      </div>
                      
                      <p className="text-gray-900 mb-3">{answer.questionText}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 w-20">Your Answer:</span>
                          <span className={`text-sm ${
                            answer.isCorrect ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {answer.selectedAnswer || 'Not answered'}
                          </span>
                        </div>
                        
                        {!answer.isCorrect && (
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-600 w-20">Correct:</span>
                            <span className="text-sm text-green-700">{answer.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuizResults;