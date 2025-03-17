
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB, { verifyDbConnection } from '../../../lib/db/connect';
import { Resource } from '../../../lib/db/models/Resource';

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
    
    const { resourceId, action } = req.body;
    
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
        resource.stats.views += 1;
        break;
      case 'download':
        resource.stats.downloads += 1;
        break;
      case 'like':
        resource.stats.likes += 1;
        break;
      case 'comment':
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
