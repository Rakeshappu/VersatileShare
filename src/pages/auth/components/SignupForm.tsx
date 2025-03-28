
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupFormData } from '../../../types/auth';
import { authService } from '../../../services/auth.service';
import { useAuth } from '../../../contexts/AuthContext';
import { SignupForm as SignupFormComponent } from '../../../components/auth/SignupForm';
import { toast } from 'react-hot-toast';

export const SignupForm = () => {
  const navigate = useNavigate();
  const { setError } = useAuth();
  const selectedRole = localStorage.getItem('selectedRole') as 'student' | 'faculty';
  
  const handleSubmit = async (formData: SignupFormData) => {
    try {
      // Validate USN for students
      if (formData.role === 'student' && (!formData.usn || formData.usn.trim() === '')) {
        toast.error('USN is required for student registration');
        return;
      }
      
      // Send the form data including USN to the registration endpoint
      await authService.signup(formData);
      toast.success('Registration successful! Please verify your email.');
      navigate('/auth/verify', { state: { email: formData.email } });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <SignupFormComponent role={selectedRole} onSubmit={handleSubmit} />
  );
};
