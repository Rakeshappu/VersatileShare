import React from 'react';
import { Award, Calendar } from 'lucide-react';
import { User } from '../../types';

interface UserBannerProps {
  user: User;
}

export const UserBanner = ({ user }: UserBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full border-2 border-white"
          />
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
            <p className="text-indigo-200">
              {user.semester}th Semester • {user.department}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-300" />
              <span className="text-2xl font-bold">{user.streak}</span>
            </div>
            <p className="text-sm text-indigo-200">Day Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-300" />
              <span className="text-2xl font-bold">12</span>
            </div>
            <p className="text-sm text-indigo-200">Activities Today</p>
          </div>
        </div>
      </div>
    </div>
  );
};