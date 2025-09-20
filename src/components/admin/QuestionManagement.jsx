// src/components/admin/QuestionManagement.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import Layout from '../common/Layout';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  HelpCircle,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuestionManagement = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    type: 'MultipleChoice',
    options: ['', '', '', ''],
    correctAnswer: '',
    order: 1
  });

  useEffect(() => {
    fetchQuizAndQuestions();
  }, [quizId]);

  const fetchQuizAndQuestions = async () => {
    try {
      setLoading(true);
      const response = await apiService.quiz.getById(quizId, token);
      
      if (response.success) {
        setQuiz(response.data);
        setQuestions(response.data.questions || []);
      } else {
        toast.error('Quiz not found');
        navigate('/admin/quizzes');
      }
    } catch (error) {
      toast.error('Failed to load quiz');
      navigate('/admin/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const questionData = {
        ...formData,
        options: formData.type === 'MultipleChoice' ? formData.options.filter(opt => opt.trim()) : null,
        order: questions.length + 1
      };

      const response = await apiService.question.create(quizId, questionData, token);
      
      if (response.success) {
        toast.success('Question created successfully');
        setQuestions([...questions, response.data]);
        setShowAddModal(false);
        resetForm();
      } else {
        toast.error(response.message || 'Failed to create question');
      }
    } catch (error) {
      toast.error('Failed to create question');
      console.error('Create error:', error);
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const questionData = {
        ...formData,
        options: formData.type === 'MultipleChoice' ? formData.options.filter(opt => opt.trim()) : null
      };

      const response = await apiService.question.update(quizId, editingQuestion.questionId, questionData, token);
      
      if (response.success) {
        toast.success('Question updated successfully');
        setQuestions(questions.map(q => 
          q.questionId === editingQuestion.questionId ? response.data : q
        ));
        setEditingQuestion(null);
        resetForm();
      } else {
        toast.error(response.message || 'Failed to update question');
      }
    } catch (error) {
      toast.error('Failed to update question');
      console.error('Update error:', error);
    }
  };

  const handleDeleteQuestion = async (question) => {
    if (!window.confirm(`Are you sure you want to delete this question? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiService.question.delete(quizId, question.questionId, token);
      
      if (response.success) {
        toast.success('Question deleted successfully');
        setQuestions(questions.filter(q => q.questionId !== question.questionId));
      } else {
        toast.error('Failed to delete question');
      }
    } catch (error) {
      toast.error('Failed to delete question');
      console.error('Delete error:', error);
    }
  };

  const validateForm = () => {
    if (!formData.text.trim()) {
      toast.error('Question text is required');
      return false;
    }

    if (!formData.correctAnswer.trim()) {
      toast.error('Correct answer is required');
      return false;
    }

    if (formData.type === 'MultipleChoice') {
      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast.error('At least 2 options are required for multiple choice');
        return false;
      }

      if (!validOptions.includes(formData.correctAnswer)) {
        toast.error('Correct answer must be one of the options');
        return false;
      }
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      text: '',
      type: 'MultipleChoice',
      options: ['', '', '', ''],
      correctAnswer: '',
      order: 1
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (question) => {
    setFormData({
      text: question.text,
      type: question.type,
      options: question.options && question.options.length > 0 ? question.options : ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      order: question.order
    });
    setEditingQuestion(question);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingQuestion(null);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const duplicateQuestion = (question) => {
    setFormData({
      text: question.text + ' (Copy)',
      type: question.type,
      options: question.options ? [...question.options] : ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      order: questions.length + 1
    });
    setShowAddModal(true);
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

  if (!quiz) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
          <button
            onClick={() => navigate('/admin/quizzes')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back to Quizzes
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600">Manage quiz questions</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/quizzes')}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Quizzes
            </button>
            
            <button
              onClick={openAddModal}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Question
            </button>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-blue-800">Total Questions</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{quiz.duration}</div>
              <div className="text-sm text-green-800">Duration (min)</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {questions.filter(q => q.type === 'MultipleChoice').length}
              </div>
              <div className="text-sm text-purple-800">Multiple Choice</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {questions.filter(q => q.type === 'TrueFalse').length}
              </div>
              <div className="text-sm text-orange-800">True/False</div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {questions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {questions.map((question, index) => (
                <div key={question.questionId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold mr-3">
                          {index + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          question.type === 'MultipleChoice' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {question.type === 'MultipleChoice' ? 'Multiple Choice' : 'True/False'}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        {question.text}
                      </h3>

                      {question.type === 'MultipleChoice' && question.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded-lg border text-sm ${
                                option === question.correctAnswer
                                  ? 'border-green-500 bg-green-50 text-green-800'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              {option === question.correctAnswer && (
                                <CheckCircle className="w-4 h-4 inline mr-1" />
                              )}
                              {option}
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'TrueFalse' && (
                        <div className="flex space-x-2 mb-3">
                          <div className={`p-2 rounded-lg border text-sm ${
                            question.correctAnswer === 'True'
                              ? 'border-green-500 bg-green-50 text-green-800'
                              : 'border-gray-200 bg-gray-50'
                          }`}>
                            {question.correctAnswer === 'True' && (
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                            )}
                            True
                          </div>
                          <div className={`p-2 rounded-lg border text-sm ${
                            question.correctAnswer === 'False'
                              ? 'border-green-500 bg-green-50 text-green-800'
                              : 'border-gray-200 bg-gray-50'
                          }`}>
                            {question.correctAnswer === 'False' && (
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                            )}
                            False
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => duplicateQuestion(question)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Duplicate Question"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => openEditModal(question)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit Question"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteQuestion(question)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions added yet</h3>
              <p className="text-gray-500 mb-4">Start building your quiz by adding some questions</p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Question
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Question Modal */}
        {(showAddModal || editingQuestion) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-90vh overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion} className="p-6 space-y-6">
                {/* Question Text */}
                <div>
                  <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    id="text"
                    name="text"
                    required
                    rows={3}
                    value={formData.text}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter your question here..."
                  />
                </div>

                {/* Question Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="MultipleChoice">Multiple Choice</option>
                    <option value="TrueFalse">True/False</option>
                  </select>
                </div>

                {/* Options (Multiple Choice) */}
                {formData.type === 'MultipleChoice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options *
                    </label>
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder={`Option ${index + 1}`}
                          />
                          {formData.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {formData.options.length < 6 && (
                      <button
                        type="button"
                        onClick={addOption}
                        className="mt-2 text-sm text-purple-600 hover:text-purple-800"
                      >
                        + Add Another Option
                      </button>
                    )}
                  </div>
                )}

                {/* Correct Answer */}
                <div>
                  <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer *
                  </label>
                  {formData.type === 'MultipleChoice' ? (
                    <select
                      id="correctAnswer"
                      name="correctAnswer"
                      value={formData.correctAnswer}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select correct answer</option>
                      {formData.options.filter(opt => opt.trim()).map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      id="correctAnswer"
                      name="correctAnswer"
                      value={formData.correctAnswer}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select correct answer</option>
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
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
                    {editingQuestion ? 'Update Question' : 'Add Question'}
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

export default QuestionManagement;