import React from 'react';
import { BookOpen, Menu } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-indigo-600 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-2xl font-bold">EduResource Hub</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-indigo-200">Dashboard</a>
            <a href="#" className="hover:text-indigo-200">Resources</a>
            <a href="#" className="hover:text-indigo-200">Analytics</a>
            <a href="#" className="hover:text-indigo-200">Profile</a>
          </nav>
          <button className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};