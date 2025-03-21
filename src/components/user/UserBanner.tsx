
import { useEffect, useState } from 'react';
import { Award, Calendar } from 'lucide-react';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { activityService } from '../../services/activity.service';
import { toast } from 'react-hot-toast';

interface UserBannerProps {
  user?: User;
}

export const UserBanner = ({ user }: UserBannerProps) => {
  const { user: authUser } = useAuth();
  const [activitiesToday, setActivitiesToday] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the authenticated user from context if not passed as prop
  const displayUser = user || authUser;

  // Fetch activities count for today
  useEffect(() => {
    const fetchTodayActivities = async () => {
      try {
        setIsLoading(true);
        if (displayUser?._id) {
          // Safely fetch activities
          try {
            const activities = await activityService.getRecentActivities(100);
            
            // Check if activities is an array before proceeding
            if (Array.isArray(activities)) {
              // Filter for today's activities
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const todayActivities = activities.filter((activity: any) => {
                const activityDate = new Date(activity.timestamp);
                return activityDate >= today;
              });
              
              setActivitiesToday(todayActivities.length);
            } else {
              console.error('Activities is not an array:', activities);
              setActivitiesToday(0);
            }
          } catch (error) {
            console.error('Failed to fetch today activities:', error);
            setActivitiesToday(0);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTodayActivities();
  }, [displayUser]);
  
  if (!displayUser) {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-lg p-6 mb-8 animate-pulse">
        <div className="h-16 bg-indigo-700/50 rounded-lg"></div>
      </div>
    );
  }
  
  const getAvatarUrl = () => {
    if (displayUser.avatar) {
      return displayUser.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.fullName || "User")}&background=random`;
  };

  // Get a sensible name to display - make sure we always have a name to show
  const displayName = displayUser.fullName || displayUser.email?.split('@')[0] || "User";
  
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={getAvatarUrl()}
            alt={displayName}
            className="w-16 h-16 rounded-full border-2 border-white object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
            }}
          />
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {displayName}!</h2>
            <p className="text-indigo-200">
              {displayUser.semester ? `${displayUser.semester}th Semester • ` : ''}{displayUser.department || ''}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-300" />
              <span className="text-2xl font-bold">{displayUser.streak || 0}</span>
            </div>
            <p className="text-sm text-indigo-200">Day Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-300" />
              {isLoading ? (
                <div className="h-6 w-8 bg-indigo-700/50 rounded animate-pulse"></div>
              ) : (
                <span className="text-2xl font-bold">{activitiesToday}</span>
              )}
            </div>
            <p className="text-sm text-indigo-200">Activities Today</p>
          </div>
        </div>
      </div>
    </div>
  );
};
