import React from 'react';
import { TrendingUp } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
}

export const AnalyticsCard = ({ title, value, change, icon }: AnalyticsCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className="bg-indigo-100 p-3 rounded-full">
          {icon || <TrendingUp className="h-6 w-6 text-indigo-600" />}
        </div>
      </div>
      {change && (
        <div className="mt-4">
          <span className="text-green-500 text-sm font-medium">{change} increase</span>
          <span className="text-gray-600 text-sm"> from last month</span>
        </div>
      )}
    </div>
  );
};