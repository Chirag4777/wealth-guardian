import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  
  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      try {
        // Check if the token exists in localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
          console.log("Token exists in PrivateRoute:", token);
          const auth = isAuthenticated(); // Use the auth context's method
          setIsAuth(auth);
        } else {
          console.log("No token in PrivateRoute");
          setIsAuth(false);
        }
      } catch (error) {
        console.error("Error checking auth in PrivateRoute:", error);
        setIsAuth(false);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [isAuthenticated]);
  
  // If still loading auth state or not checked yet, show loading indicator
  if (loading || !authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuth) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the child routes
  console.log("Authenticated, rendering protected content");
  return <Outlet />;
};

export default PrivateRoute; 