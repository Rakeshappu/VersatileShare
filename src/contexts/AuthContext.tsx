
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SignupFormData } from '../types/auth';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socket.service';

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
  resendVerification: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Flag to control socket usage
  const useSocketFeatures = false; // Set to false to disable sockets completely

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          
          // Connect to socket service when authenticated - only if feature is enabled
          if (useSocketFeatures) {
            try {
              socketService.connect(token);
            } catch (socketError) {
              console.error('Socket connection failed:', socketError);
              // Non-critical error, don't affect the auth flow
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear potentially invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    
    // Cleanup socket connection on unmount
    return () => {
      if (useSocketFeatures) {
        socketService.disconnect();
      }
    };
  }, []);

  // Function to update user data (used when profile is updated)
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    // Update local storage
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();
      const response = await authService.login({ email, password });
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Connect to socket - only if feature is enabled
      if (useSocketFeatures && response.token) {
        try {
          socketService.connect(response.token);
        } catch (socketError) {
          console.error('Socket connection failed:', socketError);
          // Non-critical error, continue auth flow
        }
      }
      
      // Navigate based on user role
      if (response.user.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      setError(error.message || 'Login failed');
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
      setError(error.message || 'Signup failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    
    // Disconnect from socket - only if feature is enabled
    if (useSocketFeatures) {
      socketService.disconnect();
    }
    
    navigate('/auth/login');
  };

  const verifyEmail = async (token: string) => {
    try {
      setLoading(true);
      clearError();
      await authService.verifyEmail(token);
      navigate('/auth/login', { 
        state: { message: 'Email verified successfully! You can now log in.' } 
      });
    } catch (error: any) {
      setError(error.message || 'Email verification failed');
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
      navigate('/auth/login', { 
        state: { message: 'OTP verified successfully! You can now log in.' } 
      });
    } catch (error: any) {
      setError(error.message || 'OTP verification failed');
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
      setError('OTP has been resent to your email');
    } catch (error: any) {
      setError(error.message || 'Failed to resend OTP');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const resendVerification = async (email: string) => {
    try {
      setLoading(true);
      clearError();
      await authService.resendVerification(email);
      setError('Verification email has been resent');
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification email');
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
    resendVerification,
    isAuthenticated,
    updateUser,
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
