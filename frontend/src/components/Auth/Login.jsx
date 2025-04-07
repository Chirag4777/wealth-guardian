import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Check if user is already logged in, redirect if they are
  useEffect(() => {
    if (isAuthenticated()) {
      console.log("User is already authenticated, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle redirection after successful login
  useEffect(() => {
    if (loginSuccess) {
      const redirectTimer = setTimeout(() => {
        console.log("Redirecting to dashboard after successful login");
        navigate('/dashboard', { replace: true });
      }, 500); // Short delay to ensure state is updated
      
      return () => clearTimeout(redirectTimer);
    }
  }, [loginSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsLoading(true);
    console.log('Form submitted with data:', formData);
    
    try {
      // Try using the direct authService first as a workaround
      console.log("Attempting login directly with authService...");
      await authService.login(formData);
      
      // Then use the context login for state management
      console.log("Authenticating via context...");
      await login(formData);
      
      console.log("Login successful");
      toast.success('Login successful!');
      
      // Set login success flag to trigger the redirect effect
      setLoginSuccess(true);
      
      // Force check if token exists in localStorage
      const token = localStorage.getItem('token');
      console.log("Token in localStorage:", token ? "Exists" : "Not found");
      
      // Navigate directly as well for redundancy
      console.log("Attempting immediate navigation...");
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Login error details:', error);
      
      // Handle different types of errors
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          setErrors({
            general: 'Invalid email or password. Please try again.',
          });
        } else if (error.response.data && error.response.data.message) {
          setErrors({
            general: error.response.data.message,
          });
        } else {
          setErrors({
            general: 'An error occurred during login. Please try again.',
          });
        }
      } else if (error.request) {
        console.log('Error request:', error.request);
        // The request was made but no response was received
        setErrors({
          general: 'No response from server. Please check your connection and try again.',
        });
      } else {
        // Something happened in setting up the request
        setErrors({
          general: error.message || 'An error occurred. Please try again later.',
        });
      }
      
      // Show error toast
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/signup" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>
        
        {errors.general && (
          <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
            {errors.general}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            error={errors.email}
          />
          
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            error={errors.password}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login; 