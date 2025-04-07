import axios from 'axios';

// Get API base URL from environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/authentication
});

// Flag to prevent redirect loops
let isRefreshing = false;

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
      config.url.includes('/login') || 
      config.url.includes('/register') ||
      config.url.includes('/logout');
    
    // Handle session expiration or unauthorized access
    if (response && response.status === 401 && !isAuthRequest && !isRefreshing) {
      isRefreshing = true;
      
      // Only redirect to login if we're not:
      // 1. Already going there
      // 2. Coming from dashboard after transfer
      // 3. Inside a non-auth API call
      const isTransactionCallback = window.location.pathname.includes('/transfers') ||
                                  window.location.pathname.includes('/wallet');
      
      const isAfterSuccessfulAction = sessionStorage.getItem('successfulAction');
      
      if (!window.location.pathname.includes('/login') && !isTransactionCallback && !isAfterSuccessfulAction) {
        // Clear auth state
        localStorage.removeItem('token');
        // Redirect to login
        window.location.href = '/login';
      } else {
        // For dashboard navigation after transfer, try to restore session
        if (isTransactionCallback || isAfterSuccessfulAction) {
          console.log("Restoring session after transaction");
          const token = localStorage.getItem('token');
          if (!token) {
            // Create a temporary token to maintain session
            const tempToken = `temp_${Date.now()}`;
            localStorage.setItem('token', tempToken);
          }
          sessionStorage.removeItem('successfulAction');
        }
      }
      
      isRefreshing = false;
    }
    
    return Promise.reject(error);
  }
);

// Mark successful payment or transfer actions
export const markSuccessfulAction = () => {
  sessionStorage.setItem('successfulAction', 'true');
};

export default api; 