import React, { useState } from 'react';
import { Settings, Moon, Sun, Bell, Shield, Key, User, Download, Globe } from 'lucide-react';

export const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [language, setLanguage] = useState('english');

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Settings className="mr-2 text-indigo-500" size={24} />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            App Settings
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Customize your application experience
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {/* Theme Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {darkMode ? <Moon className="mr-3 text-indigo-400" /> : <Sun className="mr-3 text-yellow-500" />}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Dark Mode</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enable dark mode for a better experience in low light</p>
                </div>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={darkMode} 
                    onChange={handleDarkModeToggle} 
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="mr-3 text-indigo-500" />
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Notifications</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for new uploads and shares</p>
                </div>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notificationsEnabled} 
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)} 
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {/* Auto Download */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Download className="mr-3 text-indigo-500" />
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Auto-Download</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Automatically download recommended resources</p>
                </div>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={autoDownload} 
                    onChange={() => setAutoDownload(!autoDownload)} 
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {/* Language Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="mr-3 text-indigo-500" />
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Language</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred language</p>
                </div>
              </div>
              <div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                >
                  <option value="english">English</option>
                  <option value="french">Kannada</option>

                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Security
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Manage your account security settings
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {/* Change Password */}
            <button className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              <Key className="mr-2" size={18} />
              Change Password
            </button>

            {/* Two Factor Authentication */}
            <button className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              <Shield className="mr-2" size={18} />
              Set Up Two-Factor Authentication
            </button>

            {/* Edit Profile */}
            <button className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              <User className="mr-2" size={18} />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
