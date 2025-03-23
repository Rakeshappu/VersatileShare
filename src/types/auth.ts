
export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  _id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  isEmailVerified: boolean;
  semester?: number; // Only for students
  phoneNumber?: string;
  avatar?: string;
  streak?: number;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  phoneNumber: string;
  semester?: number; // Required for students
  secretNumber?: string; // Required for faculty and admin
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface OtpVerificationData {
  email: string;
  otp: string;
}
