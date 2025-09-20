// src/hooks/useLocalStorage.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {[*, Function, Function, Function]} [value, setValue, removeValue, clearAll]
 */
export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (valueToStore === undefined || valueToStore === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Function to remove the key from localStorage and reset state
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Function to clear all localStorage (use with caution)
  const clearAll = useCallback(() => {
    try {
      window.localStorage.clear();
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [initialValue]);

  return [storedValue, setValue, removeValue, clearAll];
};

/**
 * Hook for managing localStorage with expiration
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @param {number} ttl - Time to live in milliseconds
 * @returns {[*, Function, Function, boolean]} [value, setValue, removeValue, isExpired]
 */
export const useLocalStorageWithExpiry = (key, initialValue, ttl) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      
      // Check if item has expiry and is expired
      if (parsed.expiry && Date.now() > parsed.expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }
      
      return parsed.value !== undefined ? parsed.value : parsed;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const [isExpired, setIsExpired] = useState(false);

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      setIsExpired(false);
      
      if (valueToStore === undefined || valueToStore === null) {
        window.localStorage.removeItem(key);
      } else {
        const itemWithExpiry = {
          value: valueToStore,
          expiry: ttl ? Date.now() + ttl : null
        };
        window.localStorage.setItem(key, JSON.stringify(itemWithExpiry));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, ttl]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      setIsExpired(false);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Check expiry on mount and set up interval for periodic checks
  useEffect(() => {
    const checkExpiry = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.expiry && Date.now() > parsed.expiry) {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
            setIsExpired(true);
          }
        }
      } catch (error) {
        console.error(`Error checking expiry for localStorage key "${key}":`, error);
      }
    };

    // Check immediately
    checkExpiry();

    // Set up interval to check expiry periodically (every minute)
    const interval = setInterval(checkExpiry, 60000);

    return () => clearInterval(interval);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue, isExpired];
};

/**
 * Hook for managing multiple localStorage keys as an object
 * @param {Object} initialState - Object with initial values
 * @param {string} keyPrefix - Prefix for localStorage keys
 * @returns {[Object, Function, Function]} [state, setState, clearState]
 */
export const useLocalStorageState = (initialState, keyPrefix = 'app_') => {
  const [state, setState] = useState(() => {
    const savedState = {};
    
    for (const [key, defaultValue] of Object.entries(initialState)) {
      try {
        const item = window.localStorage.getItem(`${keyPrefix}${key}`);
        savedState[key] = item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error(`Error reading localStorage key "${keyPrefix}${key}":`, error);
        savedState[key] = defaultValue;
      }
    }
    
    return savedState;
  });

  const updateState = useCallback((updates) => {
    setState(prevState => {
      const newState = { ...prevState };
      
      for (const [key, value] of Object.entries(updates)) {
        newState[key] = value;
        
        try {
          if (value === undefined || value === null) {
            window.localStorage.removeItem(`${keyPrefix}${key}`);
          } else {
            window.localStorage.setItem(`${keyPrefix}${key}`, JSON.stringify(value));
          }
        } catch (error) {
          console.error(`Error setting localStorage key "${keyPrefix}${key}":`, error);
        }
      }
      
      return newState;
    });
  }, [keyPrefix]);

  const clearState = useCallback(() => {
    setState(initialState);
    
    for (const key of Object.keys(initialState)) {
      try {
        window.localStorage.removeItem(`${keyPrefix}${key}`);
      } catch (error) {
        console.error(`Error removing localStorage key "${keyPrefix}${key}":`, error);
      }
    }
  }, [initialState, keyPrefix]);

  return [state, updateState, clearState];
};

/**
 * Hook for managing quiz draft answers in localStorage
 * @param {number} quizId - Quiz ID
 * @returns {[Object, Function, Function, Function]} [answers, setAnswer, clearAnswers, hasUnsavedChanges]
 */
export const useQuizDraftStorage = (quizId) => {
  const key = `quiz_draft_${quizId}`;
  const [draftAnswers, setDraftAnswers] = useLocalStorage(key, {});
  const [lastSaved, setLastSaved] = useState(Date.now());
  
  const setAnswer = useCallback((questionId, answer) => {
    setDraftAnswers(prev => {
      const updated = {
        ...prev,
        [questionId]: answer,
        _lastModified: Date.now()
      };
      return updated;
    });
  }, [setDraftAnswers]);

  const clearAnswers = useCallback(() => {
    setDraftAnswers({});
    setLastSaved(Date.now());
  }, [setDraftAnswers]);

  const hasUnsavedChanges = useCallback(() => {
    return draftAnswers._lastModified && draftAnswers._lastModified > lastSaved;
  }, [draftAnswers._lastModified, lastSaved]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges()) {
        setLastSaved(Date.now());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges]);

  return [draftAnswers, setAnswer, clearAnswers, hasUnsavedChanges];
};

/**
 * Hook for managing user preferences
 * @returns {[Object, Function, Function]} [preferences, updatePreferences, resetPreferences]
 */
export const useUserPreferences = () => {
  const defaultPreferences = {
    theme: 'light',
    language: 'en',
    notifications: true,
    soundEffects: true,
    autoSave: true,
    showHints: true,
    compactMode: false,
    animationsEnabled: true
  };

  const [preferences, setPreferences, clearPreferences] = useLocalStorage('user_preferences', defaultPreferences);

  const updatePreferences = useCallback((updates) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, [setPreferences, defaultPreferences]);

  return [preferences, updatePreferences, resetPreferences];
};

/**
 * Hook for managing session data with automatic cleanup
 * @param {string} key - Session storage key
 * @param {*} initialValue - Initial value
 * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
 * @returns {[*, Function, Function]} [value, setValue, clearValue]
 */
export const useSessionStorage = (key, initialValue, maxAge = 3600000) => {
  const [sessionValue, setSessionValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      
      // Check if session data is expired
      if (parsed.timestamp && Date.now() - parsed.timestamp > maxAge) {
        window.sessionStorage.removeItem(key);
        return initialValue;
      }
      
      return parsed.value !== undefined ? parsed.value : parsed;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(sessionValue) : value;
      
      setSessionValue(valueToStore);
      
      if (valueToStore === undefined || valueToStore === null) {
        window.sessionStorage.removeItem(key);
      } else {
        const itemWithTimestamp = {
          value: valueToStore,
          timestamp: Date.now()
        };
        window.sessionStorage.setItem(key, JSON.stringify(itemWithTimestamp));
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, sessionValue]);

  const clearValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
      setSessionValue(initialValue);
    } catch (error) {
      console.error(`Error clearing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [sessionValue, setValue, clearValue];
};

/**
 * Hook for managing application cache with size limits
 * @param {number} maxSize - Maximum number of items in cache
 * @returns {[Object, Function, Function, Function]} [cache, setItem, getItem, clearCache]
 */
export const useStorageCache = (maxSize = 50) => {
  const [cache, setCache] = useLocalStorage('app_cache', {});

  const setItem = useCallback((key, value, ttl = null) => {
    setCache(prevCache => {
      const newCache = { ...prevCache };
      
      // Remove oldest items if cache is full
      const cacheKeys = Object.keys(newCache);
      if (cacheKeys.length >= maxSize) {
        const sortedKeys = cacheKeys.sort((a, b) => {
          const aTime = newCache[a].timestamp || 0;
          const bTime = newCache[b].timestamp || 0;
          return aTime - bTime;
        });
        
        // Remove oldest items
        const keysToRemove = sortedKeys.slice(0, sortedKeys.length - maxSize + 1);
        keysToRemove.forEach(k => delete newCache[k]);
      }
      
      // Add new item
      newCache[key] = {
        value,
        timestamp: Date.now(),
        expiry: ttl ? Date.now() + ttl : null
      };
      
      return newCache;
    });
  }, [setCache, maxSize]);

  const getItem = useCallback((key) => {
    const item = cache[key];
    if (!item) return null;
    
    // Check if expired
    if (item.expiry && Date.now() > item.expiry) {
      // Remove expired item
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
      return null;
    }
    
    return item.value;
  }, [cache, setCache]);

  const clearCache = useCallback(() => {
    setCache({});
  }, [setCache]);

  const removeExpiredItems = useCallback(() => {
    setCache(prev => {
      const newCache = {};
      const now = Date.now();
      
      for (const [key, item] of Object.entries(prev)) {
        if (!item.expiry || now <= item.expiry) {
          newCache[key] = item;
        }
      }
      
      return newCache;
    });
  }, [setCache]);

  // Clean up expired items on mount and periodically
  useEffect(() => {
    removeExpiredItems();
    
    const interval = setInterval(removeExpiredItems, 300000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [removeExpiredItems]);

  return [cache, setItem, getItem, clearCache];
};

export default useLocalStorage;