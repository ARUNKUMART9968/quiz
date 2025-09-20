// src/components/student/QuizPlay.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Flag,
  Play,
  Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuizPlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const handleSubmitQuiz = useCallback(async (isTimeUp = false) => {
    if (submitting) return;
    
    setSubmitting(true);
    const endTime = new Date();

    try {
      const submissionData = {
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId: parseInt(questionId),
          selectedAnswer: selectedAnswer
        })),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      };

      const response = await apiService.quiz.submit(id, submissionData, token);
      
      if (response.success) {
        if (isTimeUp) {
          toast.success('Time\'s up! Quiz submitted automatically.');
        } else {
          toast.success('Quiz submitted successfully!');
        }
        
        // Navigate to results page
        navigate('/student/results', { 
          state: { 
            newResult: response.data,
            showResult: true 
          } 
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error('Failed to submit quiz. Please try again.');
      console.error('Submit error:', error);
      setSubmitting(false);
    }
  }, [answers, startTime, id, token, navigate, submitting]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await apiService.quiz.getById(id, token);
        
        if (response.success) {
          setQuiz(response.data);
          setTimeLeft(response.data.duration * 60); // Convert minutes to seconds
        } else {
          toast.error('Quiz not found');
          navigate('/student');
        }
      } catch (error) {
        toast.error('Failed to load quiz');
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, token, navigate]);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, handleSubmitQuiz]);

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date());
  };

  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }));
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const goToNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const isQuestionAnswered = (questionId) => {
    return answers.hasOwnProperty(questionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/student')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">{quiz.duration} Minutes</div>
                <div className="text-sm text-gray-600">Time Limit</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">{quiz.questions.length} Questions</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Flag className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">Single Attempt</div>
                <div className="text-sm text-gray-600">One Try Only</div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 mb-1">Important Instructions:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• You have {quiz.duration} minutes to complete this quiz</li>
                    <li>• You can navigate between questions but cannot skip any</li>
                    <li>• Make sure to submit before time runs out</li>
                    <li>• You can only attempt this quiz once</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={startQuiz}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center mx-auto"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${timeLeft <= 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-gray-600">Time Left</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {getAnsweredCount()}/{quiz.questions.length}
                </div>
                <div className="text-xs text-gray-600">Answered</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                      index === currentQuestionIndex
                        ? 'bg-indigo-600 text-white'
                        : isQuestionAnswered(quiz.questions[index].questionId)
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 space-y-2 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-indigo-600 rounded mr-2"></div>
                  <span>Current Question</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                  <span>Not Answered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentQuestion.text}
                </h2>

                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQuestion.type === 'MultipleChoice' ? (
                    currentQuestion.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          answers[currentQuestion.questionId] === option
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.questionId}`}
                          value={option}
                          checked={answers[currentQuestion.questionId] === option}
                          onChange={() => handleAnswerChange(currentQuestion.questionId, option)}
                          className="mr-4 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))
                  ) : currentQuestion.type === 'TrueFalse' ? (
                    ['True', 'False'].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          answers[currentQuestion.questionId] === option
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.questionId}`}
                          value={option}
                          checked={answers[currentQuestion.questionId] === option}
                          onChange={() => handleAnswerChange(currentQuestion.questionId, option)}
                          className="mr-4 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))
                  ) : null}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={goToPrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Previous
                </button>

                <div className="flex space-x-4">
                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <button
                      onClick={() => handleSubmitQuiz(false)}
                      disabled={submitting || getAnsweredCount() === 0}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Flag className="w-5 h-5 mr-2" />
                      )}
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={goToNext}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                    >
                      Next
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPlay;