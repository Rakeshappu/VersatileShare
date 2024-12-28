import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/auth.service';
import { FormField } from '../../../components/auth/FormField';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth(); 
  const { setError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // try {
    //   const response = await authService.login(formData);
    //   const role = response.user.role;
    //   navigate(role === 'faculty' ? '/faculty/dashboard' : '/dashboard');
    // } catch (err: any) {
    //   setError(err.message);
    // }

    try {
      await login(formData.email, formData.password);
      // No need for navigation here - AuthContext handles it
    } catch (err) {
      // Error handling is done by context
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign in
          </button>

          <div className="text-sm text-center">
            <Link to="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};