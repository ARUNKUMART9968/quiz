// src/components/student/Leaderboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import Layout from '../common/Layout';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star,
  Users,
  TrendingUp,
  Target,
  Award,
  Filter,
  Globe,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState(null);
  const [quizLeaderboards, setQuizLeaderboards] = useState({});
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('global');
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);

  const { token, user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedQuiz !== 'global' && !quizLeaderboards[selectedQuiz]) {
      fetchQuizLeaderboard(selectedQuiz);
    }
  }, [selectedQuiz]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch global leaderboard
      const globalResponse = await apiService.leaderboard.getGlobalLeaderboard(20, token);
      if (globalResponse.success) {
        setGlobalLeaderboard(globalResponse.data);
      }

      // Fetch available quizzes
      const quizzesResponse = await apiService.quiz.getAll(token);
      if (quizzesResponse.success) {
        setAvailableQuizzes(quizzesResponse.data);
      }

      // Fetch user stats
      try {
        const statsResponse = await apiService.leaderboard.getMyStats(token);
        if (statsResponse.success) {
          setUserStats(statsResponse.data);
        }
      } catch (error) {
        console.log('User stats not available');
      }

    } catch (error) {
      toast.error('Failed to load leaderboard data');
      console.error('Leaderboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizLeaderboard = async (quizId) => {
    try {
      const response = await apiService.leaderboard.getQuizLeaderboard(quizId, 20, token);
      if (response.success) {
        setQuizLeaderboards(prev => ({
          ...prev,
          [quizId]: response.data
        }));
      }
    } catch (error) {
      toast.error('Failed to load quiz leaderboard');
      console.error('Quiz leaderboard error:', error);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300';
      default:
        return 'bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const currentLeaderboard = selectedQuiz === 'global' ? globalLeaderboard : quizLeaderboards[selectedQuiz];
  const isGlobalView = selectedQuiz === 'global';

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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Leaderboard 🏆</h1>
          <p className="text-purple-100">See how you rank against other students</p>
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2 text-purple-600" />
              Your Performance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userStats.totalQuizzesAttempted}</div>
                <div className="text-sm text-blue-800">Quizzes Attempted</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userStats.averageScore.toFixed(1)}%</div>
                <div className="text-sm text-green-800">Average Score</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{userStats.bestScore.toFixed(1)}%</div>
                <div className="text-sm text-purple-800">Best Score</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{userStats.accuracyRate.toFixed(1)}%</div>
                <div className="text-sm text-orange-800">Accuracy Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">View Leaderboard:</span>
            
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="global">Global Leaderboard</option>
              {availableQuizzes.map((quiz) => (
                <option key={quiz.quizId} value={quiz.quizId}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leaderboard Content */}
        {currentLeaderboard ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Leaderboard Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isGlobalView ? (
                    <Globe className="w-6 h-6 mr-3" />
                  ) : (
                    <BookOpen className="w-6 h-6 mr-3" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">
                      {isGlobalView ? 'Global Leaderboard' : currentLeaderboard.quizTitle}
                    </h2>
                    <p className="text-purple-100 text-sm">
                      {isGlobalView 
                        ? `${currentLeaderboard.totalStudents} students • ${currentLeaderboard.totalQuizzes} quizzes`
                        : `${currentLeaderboard.totalParticipants} participants • Avg: ${currentLeaderboard.averageScore.toFixed(1)}%`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {isGlobalView 
                      ? currentLeaderboard.overallAverageScore.toFixed(1) 
                      : currentLeaderboard.averageScore.toFixed(1)
                    }%
                  </div>
                  <div className="text-sm text-purple-100">Average</div>
                </div>
              </div>
            </div>

            {/* Top 3 Podium */}
            {(isGlobalView ? currentLeaderboard.topStudents : currentLeaderboard.topPerformers).length >= 3 && (
              <div className="p-6 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">🥇 Top Performers 🥇</h3>
                <div className="flex justify-center items-end space-x-4">
                  {/* Second Place */}
                  {(isGlobalView ? currentLeaderboard.topStudents : currentLeaderboard.topPerformers)[1] && (
                    <div className="text-center">
                      <div className="w-20 h-16 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg flex items-center justify-center mb-2">
                        <Medal className="w-8 h-8 text-white" />
                      </div>
                      <div className="p-3 bg-white rounded-lg shadow-md border-2 border-gray-300">
                        <div className="font-semibold text-sm truncate w-20">
                          {(isGlobalView ? currentLeaderboard.topStudents : currentLeaderboard.topPerformers)[1].userName}
                        </div>
                        <div className="text-lg font-bold text-gray-600">
                          {(isGlobalView 
                            ? currentLeaderboard.topStudents[1].averageScore 
                            : currentLeaderboard.topPerformers[1].score
                          ).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">#2</div>
                      </div>
                    </div>
                  )}

                  {/* First Place */}
                  {(isGlobalView ? currentLeaderboard.topStudents : currentLeaderboard.topPerformers)[0] && (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-lg flex items-center justify-center mb-2">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <div className="p-3 bg-white rounded-lg shadow-lg border-2 border-yellow-400">
                        <div className="font-semibold text-sm truncate w-20">
                          {(isGlobalView ? currentLeaderboard.topStudents : currentLeaderboard.topPerformers)[0].userName}
                        </div>
                        <div className="text-lg font-bold text-yellow-600">
                          {(isGlobalView 
                            ? currentLeaderboard.topStudents[0].averageScore 
                            : currentLeaderboard.topPerformers[0].score
                          ).toFixed(1)}%
                        </div>
                        <div className="text-xs text-yellow-600">#1</div>
                      </div>
                    </div>
                  )}

                  {/* Third Place */}
                  {(isGlobalView ? currentLeaderboard.topStudents : currentLeaderboard.topPerformers)[2] && (
                    <div className="text-center">
                      <div className="w-20 h-12 bg-gradient-to-t from-amber-500 to-amber-600 rounded-t-lg flex items-center justify-center mb-2">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <div className="p-3 bg-white rounded-lg shadow-md border-2 border-amber-500">
                        <div className="font-semibold text-sm truncate w-20">
                          {(isGlobalView ? currentLeaderboard.topStudents : currentLeaderboard.topPerformers)[2].userName}
                        </div>
                        <div className="text-lg font-bold text-amber-600">
                          {(isGlobalView 
                            ? currentLeaderboard.topStudents[2].averageScore 
                            : currentLeaderboard.topPerformers[2].score
                          ).toFixed(1)}%
                        </div>
                        <div className="text-xs text-amber-600">#3</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="divide-y divide-gray-200">
              {(isGlobalView ? currentLeaderboard.topStudents : currentLeaderboard.topPerformers).map((entry, index) => {
                const rank = isGlobalView ? entry.globalRank : entry.rank;
                const isCurrentUser = entry.userId === user.userId;
                
                return (
                  <div
                    key={entry.userId}
                    className={`p-4 flex items-center space-x-4 transition-all duration-200 ${getRankClass(rank)} ${
                      isCurrentUser ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      {getRankIcon(rank)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold truncate ${
                          isCurrentUser ? 'text-purple-900' : 'text-gray-900'
                        }`}>
                          {entry.userName}
                          {isCurrentUser && (
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              You
                            </span>
                          )}
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        {isGlobalView ? (
                          <>
                            <span className="flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              {entry.quizzesAttempted} quizzes
                            </span>
                            <span className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              {entry.accuracyPercentage.toFixed(0)}% accuracy
                            </span>
                            <span className="text-xs">
                              Last active: {formatDate(entry.lastAttempt)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              {entry.correctAnswers}/{entry.totalQuestions}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {entry.timeTaken && `${Math.floor(entry.timeTaken.totalMinutes || 0)}m`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        getPerformanceColor(isGlobalView ? entry.averageScore : entry.score)
                      }`}>
                        {(isGlobalView ? entry.averageScore : entry.score).toFixed(1)}%
                      </div>
                      {isGlobalView && (
                        <div className="text-xs text-gray-500 mt-1">
                          Best: {entry.bestScore.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              {selectedQuiz === 'global' 
                ? 'No students have completed any quizzes yet.'
                : 'No students have completed this quiz yet.'
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;