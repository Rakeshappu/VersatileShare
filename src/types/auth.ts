export type UserRole = 'student' | 'faculty';

export interface User {
  _id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  isEmailVerified: boolean;
  semester?: number; // Only for students
}

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  phoneNumber: string;
  semester?: number; // Required for students
  secretNumber?: string; // Required for faculty
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
export interface LoginFormData {
  email: string;
  password: string;
}
export interface OtpVerificationData {
  email: string;
  otp: string;
}