import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRole, SignupFormData } from '../../types/auth';
import { FormField } from './FormField';

interface SignupFormProps {
  role: UserRole;
  onSubmit: (data: SignupFormData) => void;
}

export const SignupForm = ({ role, onSubmit }: SignupFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    role,
    fullName: '',
    email: '',
    department: '',
    phoneNumber: '',
    password: '',
    secretNumber: role === 'faculty' ? '' : undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const departments = [
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Mechanical', label: 'Mechanical' },
    { value: 'Civil', label: 'Civil' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up as {role}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <FormField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
            />

            <FormField
              label="Department"
              name="department"
              type="select"
              value={formData.department}
              onChange={handleChange}
              options={departments}
            />

            <FormField
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
            />

            {role === 'faculty' && (
              <FormField
                label="Faculty Secret Number"
                name="secretNumber"
                value={formData.secretNumber || ''}
                onChange={handleChange}
                placeholder="Faculty Secret Number"
              />
            )}

            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign up
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account?</span>{' '}
            <Link 
              to="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};