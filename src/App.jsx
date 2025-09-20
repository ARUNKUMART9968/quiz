// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import StudentDashboard from './components/student/StudentDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import QuizPlay from './components/student/QuizPlay';
import QuizResults from './components/student/QuizResults';
import Leaderboard from './components/student/Leaderboard';
import QuizManagement from './components/admin/QuizManagement';
import QuestionManagement from './components/admin/QuestionManagement';
import AdminResults from './components/admin/AdminResults';
import AdminLeaderboard from './components/admin/AdminLeaderboard';
import { Toaster } from 'react-hot-toast';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute requiredRole="Student">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/quiz/:id" element={
              <ProtectedRoute requiredRole="Student">
                <QuizPlay />
              </ProtectedRoute>
            } />
            <Route path="/student/results" element={
              <ProtectedRoute requiredRole="Student">
                <QuizResults />
              </ProtectedRoute>
            } />
            <Route path="/student/leaderboard" element={
              <ProtectedRoute requiredRole="Student">
                <Leaderboard />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/quizzes" element={
              <ProtectedRoute requiredRole="Admin">
                <QuizManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/quiz/:id/questions" element={
              <ProtectedRoute requiredRole="Admin">
                <QuestionManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/results" element={
              <ProtectedRoute requiredRole="Admin">
                <AdminResults />
              </ProtectedRoute>
            } />
            <Route path="/admin/leaderboard" element={
              <ProtectedRoute requiredRole="Admin">
                <AdminLeaderboard />
              </ProtectedRoute>
            } />
            
            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;