
import api from './api';

export const activityService = {
  async logActivity(data: {
    type: 'upload' | 'download' | 'view' | 'like' | 'comment' | 'share';
    resourceId?: string;
    message: string;
  }) {
    try {
      const response = await api.post('/api/user/activity', data);
      return response.data;
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error to prevent disrupting user experience
      return null;
    }
  },

  async getRecentActivities(limit = 10) {
    try {
      const response = await api.get(`/api/user/activity?limit=${limit}`);
      return response.data.activities;
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  }
};
