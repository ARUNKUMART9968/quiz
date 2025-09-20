// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiService.auth.login({ email, password });
      
      if (response.success) {
        const { token: newToken, user: userData } = response.data;
        
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.auth.register(userData);
      
      if (response.success) {
        const { token: newToken, user: newUser } = response.data;
        
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        return { success: true, user: newUser };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const isAdmin = () => {
    return user?.role === 'Admin';
  };

  const isStudent = () => {
    return user?.role === 'Student';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isStudent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};