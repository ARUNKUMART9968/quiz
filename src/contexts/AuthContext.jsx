// src/contexts/AuthContext.jsx - Fixed version
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

// Safe localStorage wrapper
const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn('localStorage getItem failed:', error);
    }
    return null;
  },
  
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (error) {
      console.warn('localStorage setItem failed:', error);
    }
    return false;
  },
  
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      console.warn('localStorage removeItem failed:', error);
    }
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = safeLocalStorage.getItem('token');
      const storedUser = safeLocalStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear corrupted data
          safeLocalStorage.removeItem('token');
          safeLocalStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email }); // Debug log
      
      const response = await apiService.auth.login({ email, password });
      console.log('Login response:', response); // Debug log
      
      if (response.success && response.data) {
        // Backend returns AuthResponseDto with Token and User properties
        const { token: newToken, user: userData } = response.data;
        
        if (newToken && userData) {
          setToken(newToken);
          setUser(userData);
          
          // Store safely
          safeLocalStorage.setItem('token', newToken);
          safeLocalStorage.setItem('user', JSON.stringify(userData));
          
          return { success: true, user: userData };
        } else {
          console.error('Invalid response structure:', response.data);
          return { success: false, error: 'Invalid response from server' };
        }
      } else {
        return { success: false, error: response.message || response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration with:', { ...userData, password: '[HIDDEN]' }); // Debug log
      
      const response = await apiService.auth.register(userData);
      console.log('Register response:', response); // Debug log
      
      if (response.success && response.data) {
        // Backend returns AuthResponseDto with Token and User properties
        const { token: newToken, user: newUser } = response.data;
        
        if (newToken && newUser) {
          setToken(newToken);
          setUser(newUser);
          
          // Store safely
          safeLocalStorage.setItem('token', newToken);
          safeLocalStorage.setItem('user', JSON.stringify(newUser));
          
          return { success: true, user: newUser };
        } else {
          console.error('Invalid response structure:', response.data);
          return { success: false, error: 'Invalid response from server' };
        }
      } else {
        return { success: false, error: response.message || response.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    safeLocalStorage.removeItem('token');
    safeLocalStorage.removeItem('user');
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