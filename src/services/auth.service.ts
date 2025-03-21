
import api from './api';
import { API_ROUTES } from '../lib/api/routes';
import { SignupFormData, LoginFormData, User } from '../types/auth';

const handleApiError = (error: any, defaultMessage: string) => {
  console.error('API Error Details:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status
  });
  
  const errorMessage = error.response?.data?.error || 
                      error.response?.data?.message ||
                      error.message ||
                      defaultMessage;
  throw new Error(errorMessage);
};

export const authService = {
  async verifyToken(): Promise<{ user: User }> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }
      
      const response = await api.get(API_ROUTES.AUTH.ME);
      return response.data;
    } catch (error: any) {
      localStorage.removeItem('token'); // Clear invalid token
      localStorage.removeItem('user'); // Clear stored user too
      throw error;
    }
  },
  
  async login(data: LoginFormData) {
    try {
      console.log('Attempting login with:', data);
      const response = await api.post(API_ROUTES.AUTH.LOGIN, data);
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Invalid email or password');
    }
  },

  async signup(data: SignupFormData){
    try {
      console.log('Sending signup request:', data);
      const response = await api.post(API_ROUTES.AUTH.SIGNUP, data);
      console.log('Signup response:', response.data);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to create account');
    }
  },

  async verifyEmail(token: string){
    try {
      const response = await api.post(API_ROUTES.AUTH.VERIFY_EMAIL, { token });
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Email verification failed');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        // Use stored user data for quick rendering
        const user = JSON.parse(storedUser);
        
        // Verify with server in background
        api.get(API_ROUTES.AUTH.ME)
          .then(response => {
            // Update stored user if different
            const freshUser = response.data.user;
            if (JSON.stringify(freshUser) !== storedUser) {
              localStorage.setItem('user', JSON.stringify(freshUser));
            }
          })
          .catch(err => {
            console.error('User verification failed:', err);
            // If verification fails, clear storage
            if (err.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/auth/login';
            }
          });
        
        return user;
      }
      
      // No stored user, fetch from server
      const response = await api.get(API_ROUTES.AUTH.ME);
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  },

  async verifyOTP(email: string, otp: string) {
    try {
      console.log('Sending OTP verification request:', { email, otp });
      const response = await api.post(API_ROUTES.AUTH.VERIFY_OTP, { email, otp });
      console.log('OTP verification response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('OTP verification error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      handleApiError(error, 'OTP verification failed');
    }
  },

  async resendOTP(email: string) {
    try {
      const response = await api.post(API_ROUTES.AUTH.SEND_OTP, { email });
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to resend OTP');
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  },
  
  async resendVerification(email: string) {
    try {
      const response = await api.post(API_ROUTES.AUTH.RESEND_VERIFICATION, { email });
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to resend verification email');
    }
  },
  
  async googleLogin(token: string) {
    try {
      const response = await api.post(API_ROUTES.AUTH.GOOGLE, { token });
      
      // If the user needs to provide additional info
      if (response.status === 202) {
        return {
          needsAdditionalInfo: true,
          ...response.data
        };
      }
      
      // Normal login success
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Google authentication failed');
    }
  }
};
