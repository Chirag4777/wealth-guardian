import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import profileService from '../services/profileService';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // This effect runs once on mount to check if the user is already authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log("Checking authentication status...");
      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem('token');
        console.log("Token in localStorage:", token ? "Found" : "Not found");
        
        if (token) {
          console.log("Token exists, fetching user profile...");
          try {
            const userProfile = await authService.getCurrentUser();
            console.log("User profile fetched successfully:", userProfile);
            setCurrentUser(userProfile);
          } catch (profileError) {
            console.error("Error fetching user profile:", profileError);
            // If we can't fetch the profile, the token might be invalid
            localStorage.removeItem('token');
            setCurrentUser(null);
          }
        } else {
          console.log("No token found, user is not authenticated");
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setError('Authentication error. Please log in again.');
        localStorage.removeItem('token');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    console.log("AuthContext: Login called with credentials:", credentials);
    setLoading(true);
    
    try {
      // Call the auth service login
      const response = await authService.login(credentials);
      console.log("AuthContext: Login response:", response);
      
      // Check if we have a token in localStorage after login
      const token = localStorage.getItem('token');
      console.log("AuthContext: Token in localStorage after login:", token ? "Exists" : "Not found");
      
      if (token) {
        // If we have a token, fetch the user profile
        console.log("AuthContext: Token exists, fetching current user...");
        const userProfile = await authService.getCurrentUser();
        console.log("AuthContext: User profile:", userProfile);
        setCurrentUser(userProfile);
        setError(null);
      } else {
        // If no token but we have user data, use that
        console.log("AuthContext: No token but using user data from response");
        setCurrentUser(response);
      }
      
      return response;
    } catch (err) {
      console.error("AuthContext: Login error:", err);
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    console.log("AuthContext: Register called with user data:", userData);
    setLoading(true);
    
    try {
      const response = await authService.register(userData);
      console.log("AuthContext: Register response:", response);
      setError(null);
      return response;
    } catch (err) {
      console.error("AuthContext: Register error:", err);
      setError(err.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    console.log("AuthContext: Logout called");
    setLoading(true);
    
    try {
      // Clear user state first
      setCurrentUser(null);
      setError(null);
      
      // Then attempt API logout
      await authService.logout();
      console.log("AuthContext: Logout successful, user state cleared");
    } catch (err) {
      console.error("AuthContext: Logout error:", err);
      setError(err.message || 'Failed to logout');
    } finally {
      // Ensure loading state is reset
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    console.log("AuthContext: Update profile called with data:", userData);
    setLoading(true);
    
    try {
      // Call the profile service to update user data
      const response = await profileService.updateProfile(userData);
      console.log("AuthContext: Update profile response:", response);
      
      // After successful update, refresh user data from backend
      const updatedUser = await authService.getCurrentUser();
      setCurrentUser(updatedUser);
      
      setError(null);
      return updatedUser;
    } catch (err) {
      console.error("AuthContext: Update profile error:", err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Provide a way to directly check if authenticated that doesn't depend on state
  const isAuthenticated = () => {
    const isAuth = authService.isAuthenticated();
    console.log("AuthContext: Checking isAuthenticated:", isAuth);
    return isAuth;
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated
  };
  
  console.log("AuthContext: Current user state:", currentUser);
  console.log("AuthContext: isAuthenticated:", isAuthenticated());

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 