import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../../types/auth';
import { GraduationCap, Users } from 'lucide-react';

export const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    localStorage.setItem('selectedRole', role);
    navigate('/auth/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Versatile Share
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please select your role to continue
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleRoleSelect('student')}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <GraduationCap className="h-5 w-5 text-indigo-300" />
            </span>
            Continue as Student
          </button>

          <button
            onClick={() => handleRoleSelect('faculty')}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Users className="h-5 w-5 text-green-300" />
            </span>
            Continue as Faculty
          </button>
        </div>
      </div>
    </div>
  );
};