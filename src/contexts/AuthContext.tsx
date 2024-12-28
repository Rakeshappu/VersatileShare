import React, { createContext, useContext, useState, useEffect } from 'react';
import { User,SignupFormData } from '../types/auth';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupFormData) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  clearError: () => void;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const { user } = await authService.verifyToken();
      setUser(user);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };


  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();
      const response = await authService.login({ email, password });
      setUser(response.user);
      navigate(response.user.role === 'faculty' ? '/faculty/dashboard' : '/dashboard');
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupFormData) => {
    try {
      setLoading(true);
      clearError();
      await authService.signup(userData);
      navigate('/auth/verify', { state: { email: userData.email } });
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/auth/login');
  };

  const verifyEmail = async (token: string) => {
    try {
      setLoading(true);
      clearError();
      await authService.verifyEmail(token);
      navigate('/auth/login');
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      setLoading(true);
      clearError();
      await authService.verifyOTP(email, otp);
      navigate('/auth/login');
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (email: string) => {
    try {
      setLoading(true);
      clearError();
      await authService.resendOTP(email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    setError,  
    login,
    signup,
    logout,
    verifyEmail,
    clearError,
    verifyOTP,
    resendOTP,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}