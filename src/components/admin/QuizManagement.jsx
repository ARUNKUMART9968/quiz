// src/components/admin/QuizManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import Layout from '../common/Layout';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Clock,
  BookOpen,
  Users,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    isActive: true
  });

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [quizzes, searchTerm, filterStatus]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      console.log('Fetching quizzes with token:', token ? 'Present' : 'Missing');
      
      const response = await apiService.quiz.getMyQuizzes(token);
      console.log('Fetch quizzes response:', response);
      
      if (response.success) {
        setQuizzes(response.data || []);
      } else {
        toast.error(response.message || 'Failed to fetch quizzes');
        console.error('Failed to fetch quizzes:', response);
      }
    } catch (error) {
      toast.error('Failed to fetch quizzes');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = quizzes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(quiz => 
        filterStatus === 'active' ? quiz.isActive : !quiz.isActive
      );
    }

    setFilteredQuizzes(filtered);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: 30,
      isActive: true
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (quiz) => {
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      duration: quiz.duration,
      isActive: quiz.isActive
    });
    setEditingQuiz(quiz);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingQuiz(null);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    
    if (formData.duration < 1 || formData.duration > 300) {
      toast.error('Duration must be between 1 and 300 minutes');
      return;
    }
    
    try {
      console.log('Creating quiz with data:', formData);
      
      const response = await apiService.quiz.create(formData, token);
      console.log('Create quiz response:', response);
      
      if (response.success) {
        toast.success('Quiz created successfully');
        
        // The response.data should contain the quiz object
        const newQuiz = response.data;
        setQuizzes([newQuiz, ...quizzes]);
        setShowCreateModal(false);
        resetForm();
        
        // Navigate to question management for the new quiz
        if (newQuiz && newQuiz.quizId) {
          navigate(`/admin/quiz/${newQuiz.quizId}/questions`);
        } else {
          // Fallback: refresh the quiz list
          await fetchQuizzes();
        }
      } else {
        toast.error(response.message || response.error || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Create quiz error:', error);
      toast.error(error.message || 'Failed to create quiz');
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    
    try {
      console.log('Updating quiz with data:', formData);
      
      const response = await apiService.quiz.update(editingQuiz.quizId, formData, token);
      console.log('Update quiz response:', response);
      
      if (response.success) {
        toast.success('Quiz updated successfully');
        
        // Update the quiz in the list
        const updatedQuiz = response.data;
        setQuizzes(quizzes.map(quiz => 
          quiz.quizId === editingQuiz.quizId ? updatedQuiz : quiz
        ));
        setEditingQuiz(null);
        resetForm();
      } else {
        toast.error(response.message || response.error || 'Failed to update quiz');
      }
    } catch (error) {
      console.error('Update quiz error:', error);
      toast.error(error.message || 'Failed to update quiz');
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    if (!window.confirm(`Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting quiz:', quiz.quizId);
      
      const response = await apiService.quiz.delete(quiz.quizId, token);
      console.log('Delete quiz response:', response);
      
      if (response.success) {
        toast.success('Quiz deleted successfully');
        setQuizzes(quizzes.filter(q => q.quizId !== quiz.quizId));
      } else {
        toast.error(response.message || response.error || 'Failed to delete quiz');
      }
    } catch (error) {
      console.error('Delete quiz error:', error);
      toast.error(error.message || 'Failed to delete quiz');
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
            <p className="text-gray-600">Create and manage your quizzes</p>
          </div>
          
          <button
            onClick={openCreateModal}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Quiz
          </button>
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
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiz List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredQuizzes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Configuration
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
                  {filteredQuizzes.map((quiz) => (
                    <tr key={quiz.quizId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                          <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                            {quiz.description || 'No description'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(quiz.isActive)}`}>
                          {quiz.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            <span>{quiz.duration} minutes</span>
                          </div>
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-1 text-gray-400" />
                            <span>{quiz.questionCount} questions</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(quiz.createdAt)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/admin/results?quizId=${quiz.quizId}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Results"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => navigate(`/admin/quiz/${quiz.quizId}/questions`)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Manage Questions"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => openEditModal(quiz)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Quiz Settings"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteQuiz(quiz)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Quiz"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first quiz'
                }
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingQuiz) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
              </h2>
              
              <form onSubmit={editingQuiz ? handleUpdateQuiz : handleCreateQuiz} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter quiz description"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    required
                    min="1"
                    max="300"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Make quiz active immediately
                  </label>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                  >
                    {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuizManagement;