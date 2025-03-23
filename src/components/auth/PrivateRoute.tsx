
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: UserRole;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  // Admin can access all routes
  if (user.role === 'admin') {
    // If trying to access a specific admin route but user is an admin
    if (role === 'admin') {
      return <>{children}</>;
    }
    
    // If they're admin but trying to access a non-admin specific route
    // Just let them through (admins can see everything)
    return <>{children}</>;
  }

  // For non-admin users, check role-specific routes
  if (role && user.role !== role) {
    if (user.role === 'faculty') {
      return <Navigate to="/faculty/dashboard" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
