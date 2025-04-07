import axios from 'axios';

// Get API base URL from environment variables with fallback
const API_BASE_URL = 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/authentication
});

// Log all requests for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.baseURL}${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`Received response from ${response.config.url} with status ${response.status}`);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    const { response, config } = error;
    
    // Don't handle errors for auth-related endpoints to avoid loops
    const isAuthRequest = 
      (config.url && (
        config.url.includes('/login') || 
        config.url.includes('/register') ||
        config.url.includes('/logout')
      ));
    
    // Handle session expiration or unauthorized access
    if (response && response.status === 401 && !isAuthRequest) {
      // Clear auth state
      localStorage.removeItem('token');
      // Redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api; 