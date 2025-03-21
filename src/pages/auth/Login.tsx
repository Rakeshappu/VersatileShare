
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { MongoDBStatusBanner } from '../../components/auth/MongoDBStatusBanner';
import { authService } from '../../services/auth.service';
import { LoginFormData } from '../../types/auth';
import { checkDatabaseConnection } from '../../services/resource.service';

export const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const navigate = useNavigate();

  // Check MongoDB connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkDatabaseConnection();
        setDbStatus(status);
        console.log('MongoDB connection status:', status);
      } catch (err) {
        console.error('Failed to check DB connection:', err);
      }
    };
    
    checkConnection();
  }, []);

  const handleLogin = async (formData: LoginFormData) => {
    try {
      console.log('Login attempt with:', formData);
      
      // Show warning if MongoDB is not connected
      if (dbStatus && !dbStatus.connected) {
        console.warn('MongoDB is not connected. Using fallback authentication.');
      }
      
      const response = await authService.login(formData);
      console.log('Login response:', response);
      
      if (response?.token) {
        console.log('Login successful, navigating to dashboard...');
        navigate('/dashboard');
      } else {
        console.error('No token received');
        setError('Login failed - authentication error');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <>
      <MongoDBStatusBanner status={dbStatus} />
      <LoginForm onSubmit={handleLogin} error={error} />
    </>
  );
};

export default Login;
