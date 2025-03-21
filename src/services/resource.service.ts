
import api from './api';
import socketService from './socket.service';
import { getCache, setCache, deleteCache } from '../lib/cache/redis';
import { API_ROUTES } from '../lib/api/routes';
import { getMockResourcesByQuery, getMockResourceById } from '../lib/fallback/mock-data';
import { s3Config, redisConfig } from '../lib/config/services';

interface ResourceQuery {
  semester?: number;
  subject?: string;
  type?: string;
  search?: string;
  limit?: number;
  page?: number;
}

/**
 * Fetch resources based on query parameters
 */
export const getResources = async (query: ResourceQuery = {}) => {
  try {
    // If in development or testing and services not configured, use mock data
    if (process.env.NODE_ENV === 'development' && !s3Config.isConfigured()) {
      console.log('Using mock resources data');
      return getMockResourcesByQuery(query);
    }
    
    const queryString = new URLSearchParams();
    
    if (query.semester) queryString.append('semester', query.semester.toString());
    if (query.subject) queryString.append('subject', query.subject);
    if (query.type) queryString.append('type', query.type);
    if (query.search) queryString.append('search', query.search);
    if (query.limit) queryString.append('limit', query.limit.toString());
    if (query.page) queryString.append('page', query.page.toString());
    
    // Try to get from cache first if Redis is configured
    if (!redisConfig.useMocks) {
      const cacheKey = `resources:${queryString.toString()}`;
      const cachedResources = await getCache(cacheKey);
      
      if (cachedResources) {
        console.log('Returning cached resources');
        return cachedResources;
      }
    }
    
    console.log('Fetching resources with query:', queryString.toString());
    const response = await api.get(`${API_ROUTES.RESOURCES.LIST}?${queryString}`);
    
    // Cache results if Redis is configured
    if (!redisConfig.useMocks) {
      const cacheKey = `resources:${queryString.toString()}`;
      await setCache(cacheKey, response.data.resources, 300);
    }
    
    return response.data.resources;
  } catch (error) {
    console.error('Failed to get resources:', error);
    
    // Fallback to mock data in case of errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock resources data as fallback');
      return getMockResourcesByQuery(query);
    }
    
    throw error;
  }
};

/**
 * Create a new resource
 * Handles both direct uploads and S3 presigned URL uploads
 */
export const createResource = async (resourceData: FormData) => {
  try {
    console.log('Creating resource with data:', Object.fromEntries(resourceData.entries()));
    
    // For large files, get a presigned S3 URL first
    const fileInput = resourceData.get('file') as File;
    
    if (fileInput && fileInput.size > 5 * 1024 * 1024) { // 5MB threshold
      // Get presigned URL for S3 upload
      const presignedResponse = await api.post(API_ROUTES.STORAGE.PRESIGNED, {
        fileName: fileInput.name,
        fileType: fileInput.type,
        fileSize: fileInput.size
      });
      
      // Upload directly to S3
      await fetch(presignedResponse.data.uploadUrl, {
        method: 'PUT',
        body: fileInput,
        headers: {
          'Content-Type': fileInput.type
        }
      });
      
      // Update the form data to include the S3 file URL instead of the file
      resourceData.delete('file');
      resourceData.append('fileUrl', presignedResponse.data.fileUrl);
      resourceData.append('fileSize', fileInput.size.toString());
    }
    
    // Create the resource with the file URL (or with the file for smaller files)
    const response = await api.post(API_ROUTES.RESOURCES.CREATE, resourceData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Clear cache for resources if Redis is configured
    if (!redisConfig.useMocks) {
      await deleteCache('resources:*');
    }
    
    // Notify connected clients about the new resource
    if (socketService.isConnected()) {
      const resource = response.data.resource;
      socketService.sendResourceUpdate(resource._id, {
        action: 'created',
        resource: resource
      });
    }
    
    return response.data.resource;
  } catch (error) {
    console.error('Failed to create resource:', error);
    throw error;
  }
};

/**
 * Update a resource's statistics (views, downloads, likes, comments)
 */
export const updateResourceStats = async (resourceId: string, action: 'view' | 'download' | 'like' | 'comment') => {
  try {
    console.log('Updating resource stats:', { resourceId, action });
    
    // If in development mode and services not configured, simulate success
    if (process.env.NODE_ENV === 'development' && !s3Config.isConfigured()) {
      console.log('Simulating resource stats update in development mode');
      
      // Return mock success response
      return {
        success: true,
        stats: {
          views: action === 'view' ? 1 : 0,
          downloads: action === 'download' ? 1 : 0,
          likes: action === 'like' ? 1 : 0,
          comments: action === 'comment' ? 1 : 0
        }
      };
    }
    
    const response = await api.post(API_ROUTES.RESOURCES.STATS, { resourceId, action });
    
    // Notify connected clients about the updated stats
    if (socketService.isConnected()) {
      socketService.sendResourceUpdate(resourceId, {
        action: 'stats-updated',
        stats: response.data.stats
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to update resource stats:', error);
    // Don't throw error for stats updates to avoid disrupting the user experience
    return null;
  }
};

/**
 * Get a single resource by ID
 */
export const getResourceById = async (resourceId: string) => {
  try {
    // If in development mode and services not configured, use mock data
    if (process.env.NODE_ENV === 'development' && !s3Config.isConfigured()) {
      console.log('Using mock resource data for ID:', resourceId);
      return getMockResourceById(resourceId);
    }
    
    // Try to get from cache first if Redis is configured
    if (!redisConfig.useMocks) {
      const cacheKey = `resource:${resourceId}`;
      const cachedResource = await getCache(cacheKey);
      
      if (cachedResource) {
        return cachedResource;
      }
    }
    
    const response = await api.get(API_ROUTES.RESOURCES.GET(resourceId));
    
    // Cache the resource if Redis is configured
    if (!redisConfig.useMocks) {
      const cacheKey = `resource:${resourceId}`;
      await setCache(cacheKey, response.data.resource, 300);
    }
    
    // Join the resource room to receive real-time updates
    if (socketService.isConnected()) {
      socketService.joinResource(resourceId);
    }
    
    return response.data.resource;
  } catch (error) {
    console.error('Failed to get resource:', error);
    
    // Fallback to mock data in case of errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock resource data as fallback for ID:', resourceId);
      return getMockResourceById(resourceId);
    }
    
    throw error;
  }
};

/**
 * Delete a resource by ID
 */
export const deleteResource = async (resourceId: string) => {
  try {
    const response = await api.delete(API_ROUTES.RESOURCES.DELETE(resourceId));
    
    // Clear cache if Redis is configured
    if (!redisConfig.useMocks) {
      await deleteCache(`resource:${resourceId}`);
      await deleteCache('resources:*');
    }
    
    // Notify connected clients about the deletion
    if (socketService.isConnected()) {
      socketService.sendResourceUpdate(resourceId, {
        action: 'deleted',
        resourceId
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to delete resource:', error);
    throw error;
  }
};

/**
 * Check if the database connection is working
 */
export const checkDatabaseConnection = async () => {
  try {
    console.log('Checking database connection...');
    
    // Make the API call with the correct port
    const response = await fetch('/api/db/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Database connection status:', data);
    return data;
  } catch (error) {
    console.error('Failed to check database connection:', error);
    return { 
      connected: false, 
      error: String(error),
      message: 'Could not verify MongoDB connection'
    };
  }
};
