import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: 'student' | 'faculty';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'faculty' ? '/faculty/dashboard' : '/dashboard'} />;
  }

  return <>{children}</>;
};

export default PrivateRoute;