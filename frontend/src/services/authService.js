import api from './api';

const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      console.log('Registering user with data:', userData);
      // Note: The base URL already includes '/api', so we don't add it here
      const response = await api.post('/users/register', userData);
      console.log('Registration response:', response.data);
      
      // Check for token in headers or response data
      const token = response.headers?.authorization || 
                    (response.headers?.Authorization) || 
                    response.data.token;
      
      if (token) {
        console.log('Token received, saving to localStorage');
        localStorage.setItem('token', token.replace('Bearer ', ''));
      } else {
        console.warn('No token received from registration');
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration API error:', error.response || error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('Logging in with credentials:', credentials);
      const response = await api.post('/users/login', credentials);
      console.log('Login response:', response.data);
      console.log('Login response headers:', response.headers);
      
      // Check for token in headers or response data
      const token = response.headers?.authorization || 
                    (response.headers?.Authorization) || 
                    response.data.token;
      
      if (token) {
        console.log('Token received, saving to localStorage');
        localStorage.setItem('token', token.replace('Bearer ', ''));
      } else {
        // If no token in the response, create a temporary token from the user ID
        // This is a workaround until the backend is updated to return a proper token
        console.warn('No token received from login response, using user ID as temporary token');
        if (response.data && response.data.id) {
          const tempToken = `temp_${response.data.id}`;
          localStorage.setItem('token', tempToken);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Login API error:', error.response || error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Try to call the logout endpoint, but don't wait for it to complete
      console.log('Attempting to call logout API...');
      await api.post('/users/logout').catch(err => {
        console.warn('Logout API call failed, proceeding with client-side logout:', err);
      });
    } finally {
      // Always clear local storage regardless of API response
      console.log('Clearing authentication data from localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      
      // Clear any other auth-related data
      sessionStorage.removeItem('token');
      
      // Force reload after logout to clear any in-memory state
      console.log('Logout complete');
    }
    
    // Return true to indicate successful logout
    return true;
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    console.log('Checking if authenticated. Token exists:', !!token);
    return !!token;
  },

  // Refresh the token
  refreshToken: async () => {
    try {
      const response = await api.post('/users/refresh-token');
      const newToken = response.data.token;
      
      if (newToken) {
        localStorage.setItem('token', newToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }
};

export default authService; 