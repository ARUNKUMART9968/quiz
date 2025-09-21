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
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

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
        if (showToast && successMessage) toast.success(successMessage);
        if (onSuccess) onSuccess(response.data);
        return { success: true, data: response.data };
      } else {
        const errMsg = response.message || errorMessage || 'Request failed';
        setError(errMsg);
        if (showToast) toast.error(errMsg);
        if (onError) onError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      const errMsg = err.message || errorMessage || 'An error occurred';
      setError(errMsg);
      if (showToast) toast.error(errMsg);
      if (onError) onError(errMsg);
      return { success: false, error: errMsg };
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

      const params = dependencies.reduce((acc, dep, index) => {
        acc[`param${index}`] = dep;
        return acc;
      }, { page, pageSize });

      const response = await apiCall(params, token);

      if (response.success) {
        setData(response.data.items || response.data);
        setTotalPages(response.data.totalPages || Math.ceil((response.data.total || response.data.length) / pageSize));
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
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    nextPage: () => currentPage < totalPages && fetchPage(currentPage + 1),
    prevPage: () => currentPage > 1 && fetchPage(currentPage - 1),
    goToPage: (page) => page >= 1 && page <= totalPages && fetchPage(page),
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
    if (debounceTimer) clearTimeout(debounceTimer);

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        setError(null);
        const response = await apiCall(searchTerm, ...args, token);
        if (response.success) setData(response.data);
        else setError(response.message || 'Search failed');
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
    return () => debounceTimer && clearTimeout(debounceTimer);
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
      Object.keys(additionalData).forEach(key => formData.append(key, additionalData[key]));

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setProgress(100);
        options.onSuccess && options.onSuccess(result);
        return { success: true, data: result };
      } else {
        const errMsg = result.message || 'Upload failed';
        setError(errMsg);
        options.onError && options.onError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      const errMsg = err.message || 'Upload failed';
      setError(errMsg);
      options.onError && options.onError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, [uploadEndpoint, token, options]);

  return {
    upload,
    loading,
    progress,
    error,
    reset: () => { setProgress(0); setError(null); }
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
      if (!loading) setLoading(true);
      setError(null);

      const response = await apiCall(...dependencies, token);

      if (response.success) setData(response.data);
      else setError(response.message || 'Request failed');
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiCall, token, loading, ...dependencies]);

  useEffect(() => {
    let intervalId;
    if (isPolling) {
      fetchData();
      intervalId = setInterval(fetchData, interval);
    }
    return () => intervalId && clearInterval(intervalId);
  }, [isPolling, fetchData, interval]);

  return {
    data,
    loading,
    error,
    isPolling,
    startPolling: () => setIsPolling(true),
    stopPolling: () => setIsPolling(false),
    refetch: fetchData
  };
};

export default useApi;
