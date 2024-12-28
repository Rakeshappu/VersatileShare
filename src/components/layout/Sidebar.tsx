import React from 'react';
import { BookOpen, BarChart2, Users, Settings } from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="bg-white shadow-lg w-64 min-h-screen hidden md:block">
      <nav className="p-4">
        <div className="space-y-4">
          <div className="px-4 py-2">
            <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
          </div>
          <SidebarLink icon={<BookOpen />} text="Resources" />
          <SidebarLink icon={<BarChart2 />} text="Analytics" />
          <SidebarLink icon={<Users />} text="Faculty" />
          <SidebarLink icon={<Settings />} text="Settings" />
        </div>
      </nav>
    </aside>
  );
};

const SidebarLink = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <a
    href="#"
    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
  >
    {icon}
    <span>{text}</span>
  </a>
);