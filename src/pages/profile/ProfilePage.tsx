
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Edit2, MapPin, Building, GraduationCap, Book, ChevronRight, Award, FileText, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const { user } = useAuth();

  const ProfileSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <button className="text-indigo-600 hover:text-indigo-700">
          <Edit2 className="h-5 w-5" />
        </button>
      </div>
      {children}
    </div>
  );

  const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-center space-x-3 mb-4">
      <Icon className="h-5 w-5 text-gray-400" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <ProfileSection title="Personal Information">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{user?.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-sm text-gray-900">Not set</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <p className="mt-1 text-sm text-gray-900">Not set</p>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <InfoItem icon={Building} label="Campus" value="PES College of Engineering" />
              <InfoItem icon={GraduationCap} label="Batch" value="2025" />
              <InfoItem icon={Book} label="Department" value={user?.department || 'Not set'} />
              <InfoItem icon={GraduationCap} label="Degree" value="B.E Information Science" />
            </div>
          </div>
        </ProfileSection>

        <Link to="/profile/academic" className="block bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Academic Information</h2>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </Link>

        <Link to="/profile/resume" className="block bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-800">Resume</h2>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </Link>

        <Link to="/profile/rewards" className="block bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Award className="h-6 w-6 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-800">Rewards</h2>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </Link>

        <Link to="/profile/settings" className="block bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Settings className="h-6 w-6 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-800">Account Settings</h2>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
