// src/components/common/Layout.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LogOut, 
  User, 
  Home, 
  Trophy, 
  BarChart3, 
  BookOpen, 
  Users,
  Settings,
  Award
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'Admin';
  const baseRoute = isAdmin ? '/admin' : '/student';

  const adminMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: BookOpen, label: 'Quiz Management', path: '/admin/quizzes' },
    { icon: BarChart3, label: 'Results', path: '/admin/results' },
    { icon: Trophy, label: 'Leaderboard', path: '/admin/leaderboard' },
  ];

  const studentMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/student' },
    { icon: BarChart3, label: 'My Results', path: '/student/results' },
    { icon: Trophy, label: 'Leaderboard', path: '/student/leaderboard' },
  ];

  const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                QuizMaster
              </h1>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 rounded-lg">
                <User className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isAdmin 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700 border-r-4 border-indigo-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;