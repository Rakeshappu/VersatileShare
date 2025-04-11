//src\services\api.ts
import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: '/', // Using relative URL for API requests
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for large file uploads
});

// Request interceptor for adding auth token and handling requests
api.interceptors.request.use(
  (config) => {
    // Don't set Content-Type for FormData or file uploads
    if (
      config.data && 
      (config.data instanceof FormData || 
       config.headers['Content-Type'] === 'multipart/form-data')
    ) {
      // Let the browser set the content type and boundaries
      delete config.headers['Content-Type'];
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, 
      config.params || config.data instanceof FormData ? '[FormData]' : config.data || '');
    
    return config;
  }, 
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Response [${response.status}]:`, response.data);
    return response;
  },
  (error) => {
    // Log detailed error for debugging
    console.error('API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login if not already on an auth page
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/auth/')) {
        window.location.href = '/auth/login';
      }
    }
    
    // Extract error message from response
    const errorMessage = 
      error.response?.data?.error || 
      error.message || 
      'An error occurred';
    
    // Show error toast for API errors
    if (error.response?.status !== 401) { // Don't show toast for auth errors
      toast.error(errorMessage);
    }
    
    // Format error for easier handling in components
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Add request cancellation support
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

export default api;
