import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const Logout = ({ variant = 'default', className = '', children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('Attempting logout...');
      
      // Call both the context logout (for state) and the service logout (for API)
      await logout();
      await authService.logout();
      
      toast.success('Logged out successfully');
      console.log('Navigating to login page...');
      
      // Force a reload to clear any React state
      // and ensure we go to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out. Please try again.');
      
      // Even if there's an error, try to clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      navigate('/login');
    }
  };

  return (
    <Button 
      variant={variant}
      className={className}
      onClick={handleLogout}
    >
      {children || 'Sign Out'}
    </Button>
  );
};

export default Logout; 