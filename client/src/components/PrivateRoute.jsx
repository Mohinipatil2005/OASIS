import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkBg">
        <div className="relative flex flex-col items-center">
          {/* Animated Spinner */}
          <div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
          {/* Pulsing Text */}
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse font-sans">
            Loading your pizza profile...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, storing original location to return to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Role mismatch, redirect to user dashboard/home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
