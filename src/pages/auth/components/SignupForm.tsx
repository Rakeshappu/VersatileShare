
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupFormData } from '../../../types/auth';
import { authService } from '../../../services/auth.service';
import { useAuth } from '../../../contexts/AuthContext';
import { SignupForm as SignupFormComponent } from '../../../components/auth/SignupForm';

export const SignupForm = () => {
  const navigate = useNavigate();
  const { setError } = useAuth();
  const selectedRole = localStorage.getItem('selectedRole') as 'student' | 'faculty';
  
  const handleSubmit = async (formData: SignupFormData) => {
    try {
      await authService.signup(formData);
      navigate('/auth/verify', { state: { email: formData.email } });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <SignupFormComponent role={selectedRole} onSubmit={handleSubmit} />
  );
};
