import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignupFormData, UserRole } from '../../../types/auth';
import { authService } from '../../../services/auth.service';
import { FormField } from '../../../components/auth/FormField';
import { useAuth } from '../../../contexts/AuthContext';

export const SignupForm = () => {
  const navigate = useNavigate();
  const { setError } = useAuth();
  const selectedRole = localStorage.getItem('selectedRole') as UserRole;
  
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    role: selectedRole,
    department: '',
    phoneNumber: '',
    semester: selectedRole === 'student' ? 1 : undefined,
    secretNumber: selectedRole === 'faculty' ? '' : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.signup(formData);
      navigate('/auth/verify', { state: { email: formData.email } });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const departments = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up as {selectedRole}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <FormField
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <FormField
            label="Department"
            name="department"
            type="select"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={departments.map(dept => ({ value: dept, label: dept }))}
          />

          {selectedRole === 'student' && (
            <FormField
              label="Semester"
              name="semester"
              type="select"
              value={formData.semester?.toString() || '1'}
              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
              options={Array.from({ length: 8 }, (_, i) => ({
                value: (i + 1).toString(),
                label: `Semester ${i + 1}`
              }))}
            />
          )}

          {selectedRole === 'faculty' && (
            <FormField
              label="Faculty Secret Number"
              name="secretNumber"
              value={formData.secretNumber || ''}
              onChange={(e) => setFormData({ ...formData, secretNumber: e.target.value })}
            />
          )}

          <FormField
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
            Sign up
          </button>

          <div className="text-sm text-center">
            <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};