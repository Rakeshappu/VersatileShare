
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
  
  if (req.method !== 'POST') {
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
    
    // Get the like action
    const { like } = req.body;
    
    // Find resource
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Initialize likedBy array if it doesn't exist
    if (!resource.likedBy) {
      resource.likedBy = [];
    }
    
    const userId = new mongoose.Types.ObjectId(decoded.userId);
    const userLikedIndex = resource.likedBy.findIndex(id => id.toString() === decoded.userId);
    
    if (like && userLikedIndex === -1) {
      // Add user to likedBy if not already present
      resource.likedBy.push(userId);
      resource.stats.likes += 1;
    } else if (!like && userLikedIndex !== -1) {
      // Remove user from likedBy
      resource.likedBy.splice(userLikedIndex, 1);
      resource.stats.likes -= 1;
    }
    
    await resource.save();
    
    return res.status(200).json({ 
      success: true,
      message: like ? 'Resource liked' : 'Resource unliked',
      likesCount: resource.stats.likes
    });
  } catch (error) {
    console.error('Error updating like status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
