import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components';

const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect based on auth requirement
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // If user is already authenticated and trying to access auth pages, redirect to chat
    return <Navigate to="/chat" replace />;
  }

  return children;
};

// HOC for pages that require OTP session
export const withOTPSession = (Component) => {
  return (props) => {
    const { otpSession } = useAuth();
    
    if (!otpSession) {
      return <Navigate to="/login" replace />;
    }
    
    return <Component {...props} />;
  };
};

export default ProtectedRoute;
