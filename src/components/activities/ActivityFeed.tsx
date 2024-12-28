import React from 'react';
import { Activity } from '../../types';
import { Clock, Award, Download, Eye } from 'lucide-react';

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'complete':
      return <Award className="h-5 w-5 text-green-500" />;
    case 'download':
      return <Download className="h-5 w-5 text-blue-500" />;
    case 'view':
      return <Eye className="h-5 w-5 text-purple-500" />;
    case 'streak':
      return <Award className="h-5 w-5 text-yellow-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

interface ActivityFeedProps {
  activities: Activity[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3">
            {getActivityIcon(activity.type)}
            <div className="flex-1">
              <p className="text-sm text-gray-700">{activity.description}</p>
              <p className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <span className="text-sm font-medium text-indigo-600">
              +{activity.points} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};