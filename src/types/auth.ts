
import { Resource } from '../lib/db/models/Resource';

export interface User {
  _id: string;
  email: string;
  fullName: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  isVerified: boolean;
  usn?: string; // Added USN field for students
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'faculty';
  department?: string;
  usn?: string; // Added USN field for student registration
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (formData: LoginFormData) => Promise<void>;
  logout: () => void;
  signup: (formData: SignupFormData) => Promise<void>;
  clearError: () => void;
  setError: (error: string) => void;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export interface VerificationState {
  isLoading: boolean;
  isVerified: boolean;
  error: string | null;
}

export interface Activity {
  userId: string;
  type: 'view' | 'download' | 'like' | 'comment' | 'upload' | 'share';
  resourceId?: string;
  timestamp: Date | string;
  details?: {
    title?: string;
    subject?: string;
    semester?: number;
  };
}

export interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'note' | 'link';
  subject: string;
  semester: number;
  department: string;
  uploadedBy: string;
  fileUrl?: string;
  fileSize?: number;
  fileName?: string;
  link?: string;
  views: number;
  downloads: number;
  timestamp: string;
  category: string;
  placementCategory?: string;
}
