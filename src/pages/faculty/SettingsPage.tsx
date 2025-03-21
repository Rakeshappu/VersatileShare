
import React from 'react';

export const SettingsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Faculty Settings</h1>
      <p className="text-gray-600">This is the faculty settings page where you can manage your account and preferences.</p>
      
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          Settings management feature is being developed. 
          You'll soon be able to update your profile, notification preferences, and account settings.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
