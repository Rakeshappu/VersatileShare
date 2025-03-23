
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/db/connect';
import { Resource } from '../../../../lib/db/models/Resource';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await connectDB();
    
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Resource ID is required' });
    }
    
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Verify token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    
    // Find resource with populated likedBy and comments.author fields to get detailed user info
    const resource = await Resource.findById(id)
      .populate('likedBy', 'fullName email avatar department role')
      .populate('comments.author', 'fullName email avatar department role');
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Verify resource belongs to user (for faculty)
    if (resource.uploadedBy && resource.uploadedBy.toString() !== decoded.userId) {
      // Check user role before returning error
      const User = mongoose.models.User;
      const user = await User.findById(decoded.userId);
      
      if (!user || (user.role !== 'admin' && user.role !== 'faculty')) {
        return res.status(403).json({ error: 'You do not have permission to view this resource analytics' });
      }
    }
    
    // Process analytics data
    const analyticsData = {
      views: resource.stats.views || 0,
      downloads: resource.stats.downloads || 0,
      likes: resource.stats.likes || 0,
      comments: resource.stats.comments || 0,
      likedBy: resource.likedBy || [],
      commentDetails: resource.comments || [],
      
      // Sample data for department distribution - in real app, this would come from actual data
      departmentDistribution: [
        { name: 'Computer Science', count: Math.floor(resource.stats.views * 0.4) || 0 },
        { name: 'Information Science', count: Math.floor(resource.stats.views * 0.3) || 0 },
        { name: 'Electronics', count: Math.floor(resource.stats.views * 0.2) || 0 },
        { name: 'Mechanical', count: Math.floor(resource.stats.views * 0.1) || 0 }
      ],
      
      // Unique viewers estimation
      uniqueViewers: Math.floor(resource.stats.views * 0.7) || 0,
    };
    
    return res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Error fetching resource analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
