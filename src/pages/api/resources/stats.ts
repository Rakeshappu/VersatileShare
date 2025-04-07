
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB, { verifyDbConnection } from '../../../lib/db/connect';
import { Resource } from '../../../lib/db/models/Resource';
import { Activity } from '../../../lib/db/models/Activity';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Verify connection
    const dbStatus = await verifyDbConnection();
    if (!dbStatus.connected) {
      console.error('MongoDB connection issue:', dbStatus.message);
      return res.status(500).json({ 
        error: 'Database connection error', 
        details: dbStatus.message 
      });
    }
    
    const { resourceId, action, userId } = req.body;
    
    if (!resourceId || !action) {
      return res.status(400).json({ error: 'resourceId and action are required' });
    }
    
    const resource = await Resource.findById(resourceId);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Update the appropriate stat
    switch (action) {
      case 'view':
        // Initialize stats if needed
        if (!resource.stats) {
          resource.stats = {
            views: 0,
            downloads: 0,
            likes: 0,
            comments: 0,
            lastViewed: new Date(),
            dailyViews: []
          };
        }
        
        // Update view count
        resource.stats.views += 1;
        resource.stats.lastViewed = new Date();
        
        // Update or create daily view count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (!resource.stats.dailyViews) {
          resource.stats.dailyViews = [];
        }
        
        const todayViewIndex = resource.stats.dailyViews.findIndex(view => {
          const viewDate = new Date(view.date);
          return viewDate.toDateString() === today.toDateString();
        });
        
        if (todayViewIndex >= 0) {
          resource.stats.dailyViews[todayViewIndex].count += 1;
        } else {
          resource.stats.dailyViews.push({
            date: today,
            count: 1
          });
        }
        
        // Create activity record if userId is provided
        if (userId) {
          try {
            await Activity.create({
              user: new mongoose.Types.ObjectId(userId),
              type: 'view',
              resource: resource._id,
              details: { timestamp: new Date() },
              timestamp: new Date()
            });
          } catch (activityError) {
            console.error('Failed to create activity record:', activityError);
            // Continue with view tracking even if activity creation fails
          }
        }
        break;
        
      case 'download':
        if (!resource.stats) {
          resource.stats = {
            views: 0,
            downloads: 0,
            likes: 0,
            comments: 0,
            lastViewed: new Date()
          };
        }
        resource.stats.downloads += 1;
        
        // Create activity record if userId is provided
        if (userId) {
          try {
            await Activity.create({
              user: new mongoose.Types.ObjectId(userId),
              type: 'download',
              resource: resource._id,
              details: { timestamp: new Date() },
              timestamp: new Date()
            });
          } catch (activityError) {
            console.error('Failed to create activity record:', activityError);
          }
        }
        break;
        
      case 'like':
        if (!resource.stats) {
          resource.stats = {
            views: 0,
            downloads: 0,
            likes: 0,
            comments: 0,
            lastViewed: new Date()
          };
        }
        resource.stats.likes += 1;
        break;
        
      case 'comment':
        if (!resource.stats) {
          resource.stats = {
            views: 0,
            downloads: 0,
            likes: 0,
            comments: 0,
            lastViewed: new Date()
          };
        }
        resource.stats.comments += 1;
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    await resource.save();
    
    return res.status(200).json({ 
      success: true, 
      stats: resource.stats,
      dbStatus: dbStatus
    });
  } catch (error) {
    console.error('Error updating resource stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
