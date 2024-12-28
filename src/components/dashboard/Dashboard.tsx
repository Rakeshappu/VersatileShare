import React from 'react';
import { BarChart2, Users, BookOpen, Download } from 'lucide-react';
import { SearchBar } from '../search/SearchBar';
import { UserBanner } from '../user/UserBanner';
import { AnalyticsCard } from '../analytics/AnalyticsCard';
import { SemesterResources } from '../resources/SemesterResources';
import { QuickAccess } from '../resources/QuickAccess';
import { ActivityFeed } from '../activities/ActivityFeed';
import { currentUser, resources, recentActivities } from '../../data/mockData';

export const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-50">
      <SearchBar />
      
      <div className="mt-8">
        <UserBanner user={currentUser} />
      </div>

      <QuickAccess />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Resources"
          value="256"
          change="12%"
          icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
        />
        <AnalyticsCard
          title="Total Views"
          value="1,234"
          change="8%"
          icon={<BarChart2 className="h-6 w-6 text-indigo-600" />}
        />
        <AnalyticsCard
          title="Active Users"
          value="789"
          change="15%"
          icon={<Users className="h-6 w-6 text-indigo-600" />}
        />
        <AnalyticsCard
          title="Downloads"
          value="432"
          change="5%"
          icon={<Download className="h-6 w-6 text-indigo-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SemesterResources semester={currentUser.semester} resources={resources} />
        </div>
        <div>
          <ActivityFeed activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};