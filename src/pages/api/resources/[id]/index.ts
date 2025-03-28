
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/db/connect';
import { Resource } from '../../../../lib/db/models/Resource';
import { verifyToken } from '../../../../lib/auth/jwt';
import { runCorsMiddleware } from '../../_middleware';
import { getErrorMessage } from '../../../../utils/errorUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply CORS middleware
    await runCorsMiddleware(req, res);
    
    // Connect to the database
    await connectDB();
    
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Resource ID is required' });
    }
    
    switch (req.method) {
      case 'GET':
        return getResource(req, res, id);
      case 'PUT':
      case 'PATCH':
        return updateResource(req, res, id);
      case 'DELETE':
        return deleteResource(req, res, id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Resource API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getResource(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const resource = await Resource.findById(id)
      .populate('uploadedBy', 'fullName');
      
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Increment view count
    resource.stats.views += 1;
    resource.stats.lastViewed = new Date();
    await resource.save();
    
    return res.status(200).json({ resource });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
}

async function updateResource(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Get user from token (if available)
    let userId = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const userData = verifyToken(token);
        userId = userData.userId;
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
    
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Only creator or admin can update
    if (resource.uploadedBy && resource.uploadedBy.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this resource' });
    }
    
    // Update fields
    const allowedUpdates = ['title', 'description'];
    const updates = req.body;
    
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        resource[key] = updates[key];
      }
    });
    
    await resource.save();
    
    return res.status(200).json({ 
      resource,
      message: 'Resource updated successfully'
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
}

async function deleteResource(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    console.log(`Attempting to delete resource with ID: ${id}`);
    
    // Allow deletion without authentication for development purposes
    // In production, you'd want to check user permissions
    
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    await Resource.findByIdAndDelete(id);
    
    return res.status(200).json({ 
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
}
