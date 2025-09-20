// src/components/admin/AdminLeaderboard.js
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
  BookOpen,
  Calendar,
  Clock,
  BarChart3,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLeaderboard = () => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState(null);
  const [quizLeaderboards, setQuizLeaderboards] = useState({});
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedView, setSelectedView] = useState('global');
  const [topCount, setTopCount] = useState(20);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();

  useEffect(() => {
    fetchData();
  }, [topCount]);

  useEffect(() => {
    if (selectedView !== 'global' && !quizLeaderboards[selectedView]) {
      fetchQuizLeaderboard(selectedView);
    }
  }, [selectedView]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch global leaderboard
      const globalResponse = await apiService.leaderboard.getGlobalLeaderboard(topCount, token);
      if (globalResponse.success) {
        setGlobalLeaderboard(globalResponse.data);
      }

      // Fetch available quizzes (admin's quizzes)
      const quizzesResponse = await apiService.quiz.getMyQuizzes(token);
      if (quizzesResponse.success) {
        setAvailableQuizzes(quizzesResponse.data);
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
      const response = await apiService.leaderboard.getQuizLeaderboard(quizId, topCount, token);
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

  const exportLeaderboard = () => {
    const currentData = selectedView === 'global' ? globalLeaderboard : quizLeaderboards[selectedView];
    if (!currentData) {
      toast.error('No data to export');
      return;
    }

    const isGlobal = selectedView === 'global';
    const entries = isGlobal ? currentData.topStudents : currentData.topPerformers;

    const csvContent = [
      isGlobal 
        ? ['Rank', 'Student Name', 'Email', 'Quizzes Attempted', 'Average Score (%)', 'Best Score (%)', 'Accuracy (%)', 'Last Attempt'].join(',')
        : ['Rank', 'Student Name', 'Email', 'Score (%)', 'Correct Answers', 'Total Questions', 'Time Taken', 'Submitted At'].join(','),
      ...entries.map(entry => {
        if (isGlobal) {
          return [
            entry.globalRank,
            entry.userName,
            entry.email,
            entry.quizzesAttempted,
            entry.averageScore.toFixed(1),
            entry.bestScore.toFixed(1),
            entry.accuracyPercentage.toFixed(1),
            new Date(entry.lastAttempt).toLocaleDateString()
          ].join(',');
        } else {
          return [
            entry.rank,
            entry.userName,
            entry.email,
            entry.score.toFixed(1),
            entry.correctAnswers,
            entry.totalQuestions,
            entry.timeTaken ? `${Math.floor(entry.timeTaken.totalMinutes || 0)}m` : 'N/A',
            new Date(entry.submittedAt).toLocaleDateString()
          ].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leaderboard-${selectedView}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Leaderboard exported successfully');
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
      day: 'numeric',
      year: 'numeric'
    });
  };

  const currentLeaderboard = selectedView === 'global' ? globalLeaderboard : quizLeaderboards[selectedView];
  const isGlobalView = selectedView === 'global';

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
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Student Leaderboard 🏆</h1>
          <p className="text-yellow-100">Track top performing students across all quizzes</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">View:</span>
              
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 min-w-64"
              >
                <option value="global">Global Leaderboard</option>
                {availableQuizzes.map((quiz) => (
                  <option key={quiz.quizId} value={quiz.quizId}>
                    {quiz.title}
                  </option>
                ))}
              </select>

              <select
                value={topCount}
                onChange={(e) => setTopCount(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </select>
            </div>

            {currentLeaderboard && (
              <button
                onClick={exportLeaderboard}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Leaderboard Content */}
        {currentLeaderboard ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Leaderboard Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
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
                    <p className="text-yellow-100 text-sm">
                      {isGlobalView 
                        ? `${currentLeaderboard.totalStudents} students • ${currentLeaderboard.totalQuizzes} quizzes`
                        : `${currentLeaderboard.totalParticipants} participants • ${currentLeaderboard.topPerformers.length} showing`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {(isGlobalView 
                      ? currentLeaderboard.overallAverageScore 
                      : currentLeaderboard.averageScore
                    ).toFixed(1)}%
                  </div>
                  <div className="text-sm text-yellow-100">Average Score</div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            {!isGlobalView && currentLeaderboard && (
              <div className="bg-gray-50 p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-lg font-bold text-blue-600">{currentLeaderboard.totalParticipants}</div>
                    <div className="text-sm text-gray-600">Total Participants</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-lg font-bold text-green-600">{currentLeaderboard.highestScore.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Highest Score</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-lg font-bold text-orange-600">{currentLeaderboard.averageScore.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-lg font-bold text-red-600">{currentLeaderboard.lowestScore.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Lowest Score</div>
                  </div>
                </div>
              </div>
            )}

            {/* Top 3 Podium */}
            {(isGlobalView ? currentLeaderboard.topStudents : currentLeaderboard.topPerformers).length >= 3 && (
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">🥇 Top 3 Performers 🥇</h3>
                <div className="flex justify-center items-end space-x-4">
                  {/* Second Place */}
                  {(isGlobalView ? currentLeaderboard.topStudents : currentLeaderboard.topPerformers)[1] && (
                    <div className="text-center">
                      <div className="w-20 h-16 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg flex items-center justify-center mb-2">
                        <Medal className="w-8 h-8 text-white" />
                      </div>
                      <div className="p-3 bg-white rounded-lg shadow-md border-2 border-gray-300 min-w-[120px]">
                        <div className="font-semibold text-sm truncate">
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
                      <div className="p-3 bg-white rounded-lg shadow-lg border-2 border-yellow-400 min-w-[120px]">
                        <div className="font-semibold text-sm truncate">
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
                      <div className="p-3 bg-white rounded-lg shadow-md border-2 border-amber-500 min-w-[120px]">
                        <div className="font-semibold text-sm truncate">
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

            {/* Full Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isGlobalView ? 'Average Score' : 'Quiz Score'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isGlobalView ? 'Performance' : 'Answers'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isGlobalView ? 'Activity' : 'Time'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(isGlobalView ? currentLeaderboard.topStudents : currentLeaderboard.topPerformers).map((entry) => {
                    const rank = isGlobalView ? entry.globalRank : entry.rank;
                    
                    return (
                      <tr key={entry.userId} className={`transition-all duration-200 ${getRankClass(rank)}`}>
                        {/* Rank */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center w-12">
                            {getRankIcon(rank)}
                          </div>
                        </td>

                        {/* Student Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {entry.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{entry.userName}</div>
                              <div className="text-sm text-gray-500">{entry.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-2xl font-bold text-gray-900">
                            {(isGlobalView ? entry.averageScore : entry.score).toFixed(1)}%
                          </div>
                          {isGlobalView && (
                            <div className="text-sm text-gray-500">
                              Best: {entry.bestScore.toFixed(1)}%
                            </div>
                          )}
                        </td>

                        {/* Performance/Answers */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isGlobalView ? (
                            <div className="text-sm">
                              <div className="flex items-center mb-1">
                                <Target className="w-4 h-4 text-blue-500 mr-1" />
                                <span>{entry.quizzesAttempted} quizzes</span>
                              </div>
                              <div className="flex items-center">
                                <BarChart3 className="w-4 h-4 text-green-500 mr-1" />
                                <span>{entry.accuracyPercentage.toFixed(1)}% accuracy</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <div className="flex items-center mb-1">
                                <span className="text-green-600 font-medium">{entry.correctAnswers}</span>
                                <span className="text-gray-400 mx-1">/</span>
                                <span className="text-gray-600">{entry.totalQuestions}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {((entry.correctAnswers / entry.totalQuestions) * 100).toFixed(0)}% correct
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Activity/Time */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {isGlobalView ? (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(entry.lastAttempt)}
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {entry.timeTaken ? `${Math.floor(entry.timeTaken.totalMinutes || 0)}m ${Math.floor((entry.timeTaken.totalSeconds || 0) % 60)}s` : 'N/A'}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            getPerformanceColor(isGlobalView ? entry.averageScore : entry.score)
                          }`}>
                            {isGlobalView ? entry.performanceLevel : entry.performanceLevel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Leaderboard Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing top {(isGlobalView ? currentLeaderboard.topStudents : currentLeaderboard.topPerformers).length} 
                  {isGlobalView ? ' students' : ' participants'}
                </span>
                
                <div className="flex items-center space-x-4">
                  <span>Average: <strong>{(isGlobalView ? currentLeaderboard.overallAverageScore : currentLeaderboard.averageScore).toFixed(1)}%</strong></span>
                  {!isGlobalView && (
                    <>
                      <span>Highest: <strong>{currentLeaderboard.highestScore.toFixed(1)}%</strong></span>
                      <span>Participants: <strong>{currentLeaderboard.totalParticipants}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Leaderboard Data</h3>
            <p className="text-gray-600">
              {selectedView === 'global' 
                ? 'No student performance data available yet.'
                : 'No participants for this quiz yet.'
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminLeaderboard;