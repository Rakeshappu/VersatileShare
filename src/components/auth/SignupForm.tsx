
import React, { useState } from 'react';
import { SignupFormData } from '../../types/auth';
import { FormField } from './FormField';
import { GoogleLoginButton } from './GoogleLoginButton';

interface SignupFormProps {
  onSubmit: (formData: SignupFormData) => void;
  role?: 'student' | 'faculty';
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, role = 'student' }) => {
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: role,
    department: '',
    usn: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    usn: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    } else {
      newErrors.fullName = '';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
      isValid = false;
    } else {
      newErrors.email = '';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    } else {
      newErrors.password = '';
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    } else {
      newErrors.confirmPassword = '';
    }

    // Validate department
    if (!formData.department?.trim()) {
      newErrors.department = 'Department is required';
      isValid = false;
    } else {
      newErrors.department = '';
    }

    // Validate USN for students
    if (formData.role === 'student' && !formData.usn?.trim()) {
      newErrors.usn = 'USN is required for students';
      isValid = false;
    } else {
      newErrors.usn = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Create your account
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full Name"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          placeholder="Enter your full name"
          required
        />
        
        <FormField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter your email"
          required
        />
        
        <FormField
          label="Department"
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          error={errors.department}
          placeholder="Enter your department"
          required
        />
        
        {formData.role === 'student' && (
          <FormField
            label="USN"
            type="text"
            name="usn"
            value={formData.usn}
            onChange={handleChange}
            error={errors.usn}
            placeholder="Enter your USN"
            required
          />
        )}
        
        <FormField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Create a password"
          required
        />
        
        <FormField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          required
        />
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors"
        >
          Sign Up
        </button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-6">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
};
