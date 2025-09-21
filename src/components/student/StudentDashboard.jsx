// src/components/student/StudentDashboard.js - Fixed Response Handling
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
  Users,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptChecks, setAttemptChecks] = useState({});
  
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch available quizzes
        const quizzesResponse = await apiService.quiz.getAll(token);
        if (quizzesResponse.success) {
          console.log('Fetched quizzes:', quizzesResponse.data);
          setQuizzes(quizzesResponse.data);
          
          // Check attempt status for each quiz
          await checkQuizAttempts(quizzesResponse.data);
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
            console.log('Recent results:', resultsResponse.data);
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

  const checkQuizAttempts = async (quizList) => {
    const checks = {};
    
    for (const quiz of quizList) {
      try {
        console.log(`[FRONTEND] Checking attempt for quiz ${quiz.quizId}: ${quiz.title}`);
        const response = await apiService.result.checkAttempt(quiz.quizId, token);
        
        console.log(`[FRONTEND] Raw response for quiz ${quiz.quizId}:`, response);
        
        // FIXED: Properly extract the boolean value from the response
        let hasAttempted = false;
        
        if (response && response.success) {
          // Extract the actual boolean value from the response
          if (typeof response.data === 'boolean') {
            hasAttempted = response.data;
          } else if (typeof response.data === 'string') {
            hasAttempted = response.data === 'true';
          } else if (typeof response.data === 'object' && response.data !== null) {
            // If it's an object, it likely means there's a result (attempted)
            hasAttempted = true;
          } else {
            // Default to false for any other case
            hasAttempted = false;
          }
        }
        
        checks[quiz.quizId] = {
          hasAttempted: hasAttempted,
          checked: true,
          rawResponse: response.data // Store raw response for debugging
        };
        
        console.log(`[FRONTEND] Quiz ${quiz.quizId} (${quiz.title}) - Final hasAttempted:`, hasAttempted);
        
      } catch (error) {
        console.error(`[FRONTEND] Failed to check attempt for quiz ${quiz.quizId}:`, error);
        checks[quiz.quizId] = {
          hasAttempted: false, // Default to false on error to allow attempts
          checked: false,
          error: error.message
        };
      }
    }
    
    console.log('[FRONTEND] All attempt checks completed:', checks);
    setAttemptChecks(checks);
  };

  const handleStartQuiz = async (quizId, quizTitle) => {
    try {
      console.log(`[FRONTEND] Attempting to start quiz ${quizId}: ${quizTitle}`);
      
      // Double-check attempt status before starting
      const attemptResponse = await apiService.result.checkAttempt(quizId, token);
      console.log('[FRONTEND] Final attempt check response:', attemptResponse);
      
      // FIXED: Properly check the boolean value
      let hasAttempted = false;
      if (attemptResponse && attemptResponse.success) {
        if (typeof attemptResponse.data === 'boolean') {
          hasAttempted = attemptResponse.data;
        } else if (typeof attemptResponse.data === 'object' && attemptResponse.data !== null) {
          hasAttempted = true;
        }
      }
      
      if (hasAttempted) {
        console.log('[FRONTEND] Quiz already attempted, showing error');
        toast.error('You have already completed this quiz');
        return;
      }
      
      console.log('[FRONTEND] Quiz not attempted, navigating to quiz');
      navigate(`/student/quiz/${quizId}`);
    } catch (error) {
      console.error('[FRONTEND] Error starting quiz:', error);
      toast.error('Failed to start quiz: ' + error.message);
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

  const getQuizStatus = (quizId) => {
    const check = attemptChecks[quizId];
    if (!check) return { status: 'checking', color: 'gray', text: 'Checking...' };
    if (!check.checked) return { status: 'error', color: 'red', text: 'Check Failed' };
    if (check.hasAttempted === true) return { status: 'completed', color: 'green', text: 'Completed' };
    return { status: 'available', color: 'blue', text: 'Available' };
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

        {/* Debug Info - Enhanced for troubleshooting */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>User ID: {user?.userId}</div>
              <div>Total Quizzes: {quizzes.length}</div>
              <div>Attempt checks completed: {Object.keys(attemptChecks).length}</div>
              <div>Recent results: {recentResults.length}</div>
              <div className="mt-2">
                <strong>Quiz Attempt Status:</strong>
                <div className="ml-2">
                  {Object.entries(attemptChecks).map(([quizId, check]) => (
                    <div key={quizId} className="text-xs">
                      Quiz {quizId}: {check.hasAttempted ? 'ATTEMPTED' : 'NOT ATTEMPTED'} 
                      {check.rawResponse && (
                        <span> (Raw: {JSON.stringify(check.rawResponse)})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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
              quizzes.map((quiz) => {
                const status = getQuizStatus(quiz.quizId);
                const canStart = status.status === 'available';
                
                return (
                  <div key={quiz.quizId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-gray-900 mr-3">{quiz.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            status.status === 'completed' ? 'bg-green-100 text-green-800' :
                            status.status === 'available' ? 'bg-blue-100 text-blue-800' :
                            status.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status.text}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                        
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{quiz.duration} minutes</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            <span>{quiz.questionCount} questions</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        {canStart ? (
                          <button
                            onClick={() => handleStartQuiz(quiz.quizId, quiz.title)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </button>
                        ) : status.status === 'completed' ? (
                          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completed
                          </div>
                        ) : status.status === 'error' ? (
                          <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Error
                          </div>
                        ) : (
                          <div className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">
                            {status.text}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Enhanced Debug info for each quiz */}
                    {process.env.NODE_ENV === 'development' && attemptChecks[quiz.quizId] && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div>Quiz ID: {quiz.quizId}</div>
                        <div>Has Attempted: <strong>{String(attemptChecks[quiz.quizId].hasAttempted)}</strong></div>
                        <div>Check Status: {attemptChecks[quiz.quizId].checked ? 'Success' : 'Failed'}</div>
                        <div>Raw Response: {JSON.stringify(attemptChecks[quiz.quizId].rawResponse)}</div>
                        {attemptChecks[quiz.quizId].error && (
                          <div>Error: {attemptChecks[quiz.quizId].error}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No quizzes available at the moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                Recent Results
              </h2>
              <button
                onClick={() => navigate('/student/results')}
                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
              >
                View all →
              </button>
            </div>

            <div className="space-y-4">
              {recentResults.map((result) => (
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
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;