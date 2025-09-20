// src/hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

/**
 * Custom hook for API calls with loading states and error handling
 */
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(...args, token);
      
      if (response.success) {
        setData(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Request failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCall, token, ...dependencies]);

  return {
    data,
    loading,
    error,
    execute,
    setData,
    setError
  };
};

/**
 * Hook for fetching data on component mount
 */
export const useFetch = (apiCall, dependencies = []) => {
  const { data, loading, error, execute } = useApi(apiCall, dependencies);

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, loading, error, refetch: execute };
};

/**
 * Hook for mutations (POST, PUT, DELETE) with toast notifications
 */
export const useMutation = (apiCall, options = {}) => {
  const { 
    onSuccess, 
    onError, 
    successMessage, 
    errorMessage,
    showToast = true 
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(...args, token);
      
      if (response.success) {
        if (showToast && successMessage) {
          toast.success(successMessage);
        }
        
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || errorMessage || 'Request failed';
        setError(errorMsg);
        
        if (showToast) {
          toast.error(errorMsg);
        }
        
        if (onError) {
          onError(errorMsg);
        }
        
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message || errorMessage || 'An error occurred';
      setError(errorMsg);
      
      if (showToast) {
        toast.error(errorMsg);
      }
      
      if (onError) {
        onError(errorMsg);
      }
      
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [apiCall, token, successMessage, errorMessage, showToast, onSuccess, onError]);

  return {
    mutate,
    loading,
    error,
    reset: () => setError(null)
  };
};

/**
 * Hook for paginated data fetching
 */
export const usePagination = (apiCall, pageSize = 10, dependencies = []) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchPage = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall({
        page,
        pageSize,
        ...dependencies.reduce((acc, dep, index) => {
          acc[`param${index}`] = dep;
          return acc;
        }, {})
      }, token);
      
      if (response.success) {
        setData(response.data.items || response.data);
        setTotalPages(response.data.totalPages || Math.ceil(response.data.total / pageSize));
        setTotalItems(response.data.total || response.data.length);
        setCurrentPage(page);
      } else {
        setError(response.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiCall, pageSize, token, ...dependencies]);

  useEffect(() => {
    fetchPage(1);
  }, dependencies);

  const nextPage = () => {
    if (currentPage < totalPages) {
      fetchPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      fetchPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchPage(page);
    }
  };

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    nextPage,
    prevPage,
    goToPage,
    refetch: () => fetchPage(currentPage),
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

/**
 * Hook for debounced API calls (useful for search)
 */
export const useDebounceApi = (apiCall, delay = 300) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedValue, setDebouncedValue] = useState('');
  const { token } = useAuth();

  const [debounceTimer, setDebounceTimer] = useState(null);

  const debouncedSearch = useCallback((searchTerm, ...args) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    setLoading(true);
    
    const timer = setTimeout(async () => {
      try {
        setError(null);
        const response = await apiCall(searchTerm, ...args, token);
        
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || 'Search failed');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }, delay);

    setDebounceTimer(timer);
    setDebouncedValue(searchTerm);
  }, [apiCall, delay, token, debounceTimer]);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    data,
    loading,
    error,
    debouncedValue,
    search: debouncedSearch,
    clearData: () => setData(null)
  };
};

/**
 * Hook for handling file uploads
 */
export const useFileUpload = (uploadEndpoint, options = {}) => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const upload = useCallback(async (file, additionalData = {}) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      
      // Add additional data
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        // Note: Don't set Content-Type header, let browser set it with boundary
      });

      const result = await response.json();

      if (response.ok) {
        setProgress(100);
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        return { success: true, data: result };
      } else {
        const errorMsg = result.message || 'Upload failed';
        setError(errorMsg);
        if (options.onError) {
          options.onError(errorMsg);
        }
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message || 'Upload failed';
      setError(errorMsg);
      if (options.onError) {
        options.onError(errorMsg);
      }
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [uploadEndpoint, token, options]);

  return {
    upload,
    loading,
    progress,
    error,
    reset: () => {
      setProgress(0);
      setError(null);
    }
  };
};

/**
 * Hook for real-time data (polling)
 */
export const usePolling = (apiCall, interval = 5000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const { token } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      if (!loading) {
        setLoading(true);
      }
      setError(null);
      
      const response = await apiCall(...dependencies, token);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Request failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiCall, token, loading, ...dependencies]);

  useEffect(() => {
    let intervalId;

    if (isPolling) {
      // Fetch immediately
      fetchData();
      
      // Set up polling
      intervalId = setInterval(fetchData, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, fetchData, interval]);

  const startPolling = () => setIsPolling(true);
  const stopPolling = () => setIsPolling(false);

  return {
    data,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refetch: fetchData
  };
};

export default useApi;