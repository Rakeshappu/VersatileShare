
import api from './api';

interface ResourceQuery {
  semester?: number;
  subject?: string;
  type?: string;
}

export const getResources = async (query: ResourceQuery = {}) => {
  try {
    const queryString = new URLSearchParams();
    
    if (query.semester) queryString.append('semester', query.semester.toString());
    if (query.subject) queryString.append('subject', query.subject);
    if (query.type) queryString.append('type', query.type);
    
    console.log('Fetching resources with query:', queryString.toString());
    const response = await api.get(`/api/resources?${queryString}`);
    return response.data.resources;
  } catch (error) {
    console.error('Failed to get resources:', error);
    throw error;
  }
};

export const createResource = async (resourceData: any) => {
  try {
    const response = await api.post('/api/resources', resourceData);
    return response.data.resource;
  } catch (error) {
    console.error('Failed to create resource:', error);
    throw error;
  }
};

export const updateResourceStats = async (resourceId: string, action: 'view' | 'download' | 'like' | 'comment') => {
  try {
    console.log('Updating resource stats:', { resourceId, action });
    const response = await api.post('/api/resources/stats', { resourceId, action });
    
    // Log connection status if available
    if (response.data.dbStatus) {
      console.log('MongoDB connection status:', response.data.dbStatus);
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to update resource stats:', error);
    // Don't throw error for stats updates to avoid disrupting the user experience
    return null;
  }
};

// Add a function to check MongoDB connection status
export const checkDatabaseConnection = async () => {
  try {
    console.log('Checking database connection...');
    const response = await api.get('/api/db/status');
    console.log('Database connection status:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to check database connection:', error);
    return { connected: false, error: String(error) };
  }
};
