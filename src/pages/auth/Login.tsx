// pages/auth/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { authService } from '../../services/auth.service';
import { LoginFormData } from '../../types/auth';

export const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (formData: LoginFormData) => {
    try {
      console.log('Login attempt with:', formData);
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

  return <LoginForm onSubmit={handleLogin} error={error} />;
};

export default Login;