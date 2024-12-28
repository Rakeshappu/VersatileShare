import React from 'react';
import { BarChart2, Users, ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react';
import { ResourceAnalytics } from '../../types/faculty';
import { AnalyticsCard } from '../analytics/AnalyticsCard';

interface ResourceAnalyticsProps {
  analytics: ResourceAnalytics;
  resourceTitle: string;
}

export const ResourceAnalyticsView = ({ analytics, resourceTitle }: ResourceAnalyticsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Analytics for "{resourceTitle}"
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Views"
          value={analytics.views}
          change={`${((analytics.dailyViews[6].count - analytics.dailyViews[0].count) / analytics.dailyViews[0].count * 100).toFixed(1)}%`}
          icon={<BarChart2 className="h-6 w-6 text-indigo-600" />}
        />
        <AnalyticsCard
          title="Unique Students"
          value={analytics.topDepartments.reduce((acc, curr) => acc + curr.count, 0)}
          icon={<Users className="h-6 w-6 text-blue-600" />}
        />
        <AnalyticsCard
          title="Total Likes"
          value={analytics.likes}
          icon={<ThumbsUp className="h-6 w-6 text-green-600" />}
        />
        <AnalyticsCard
          title="Comments"
          value={analytics.comments}
          icon={<MessageSquare className="h-6 w-6 text-purple-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Views Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Views</h3>
          <div className="h-64">
            {/* Add your preferred charting library here */}
            <div className="flex items-center justify-center h-full text-gray-500">
              Chart placeholder
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Distribution</h3>
          <div className="space-y-4">
            {analytics.topDepartments.map((dept) => (
              <div key={dept.name} className="flex items-center">
                <span className="w-32 text-sm text-gray-600">{dept.name}</span>
                <div className="flex-1 mx-4">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-indigo-600 rounded-full"
                      style={{
                        width: `${(dept.count / analytics.views) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600">{dept.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Student Feedback */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Feedback</h3>
          <div className="space-y-4">
            {analytics.studentFeedback.map((feedback) => (
              <div key={feedback.rating} className="flex items-center">
                <span className="w-24 text-sm text-gray-600">
                  {feedback.rating} stars
                </span>
                <div className="flex-1 mx-4">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{
                        width: `${(feedback.count / analytics.studentFeedback.reduce((acc, curr) => acc + curr.count, 0)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600">{feedback.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Trends</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">Engagement Rate</span>
              </div>
              <span className="text-sm font-medium text-green-500">+12.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600">Student Retention</span>
              </div>
              <span className="text-sm font-medium text-blue-500">85%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};