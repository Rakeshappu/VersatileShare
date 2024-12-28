import api from './api';
import { API_ROUTES } from '../lib/api/routes';
import { SignupFormData, LoginFormData, AuthResponse, User } from '../types/auth';


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
      throw error;
    }
  },
  async login(data: LoginFormData){
    try {
      const response = await api.post(API_ROUTES.AUTH.LOGIN, data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'Invalid email or password');
  }
  },

  async signup(data: SignupFormData){
    try {
      const response = await api.post(API_ROUTES.AUTH.SIGNUP, data);
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
      
      const response = await api.get(API_ROUTES.AUTH.ME);
      return response.data.user;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  },

   async verifyOTP(email: string, otp: string) {
    try {
      console.log('Sending OTP verification request:', { email, otp }); // Add this log
      const response = await api.post(API_ROUTES.AUTH.VERIFY_OTP, { email, otp });
      console.log('OTP verification response:', response.data); // Add this log
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
    window.location.href = '/auth/login';
  },
  async resendVerification(email: string) {
    try {
      const response = await api.post(API_ROUTES.AUTH.RESEND_VERIFICATION, { email });
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to resend verification email');
    }
  }
};