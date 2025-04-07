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
    let decoded;
    try {
      const token = authHeader.split(' ')[1];
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    // Get the like action
    const { like } = req.body;
    
    // Find resource
    let resource;
    try {
      resource = await Resource.findById(id);
    } catch (err) {
      console.error('Error finding resource:', err);
      return res.status(500).json({ error: 'Database error when finding resource' });
    }
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Initialize likedBy array if it doesn't exist
    if (!resource.likedBy) {
      resource.likedBy = [];
    }
    
    // Initialize stats if they don't exist
    if (!resource.stats) {
      resource.stats = {
        views: 0,
        downloads: 0,
        likes: 0,
        comments: 0,
        lastViewed: new Date()
      };
    }
    
    // Convert userId to ObjectId for consistent comparison
    const userId = new mongoose.Types.ObjectId(decoded.userId);
    
    // Find if user has already liked this resource
    const userLikedIndex = resource.likedBy.findIndex(
      (id: mongoose.Types.ObjectId) => id.toString() === decoded.userId
    );
    
    const isLiked = userLikedIndex !== -1;
    const shouldLike = like !== undefined ? like : !isLiked;
    
    if (shouldLike && !isLiked) {
      // Add user to likedBy if not already present
      resource.likedBy.push(userId);
      resource.stats.likes = (resource.stats.likes || 0) + 1;
    } else if (!shouldLike && isLiked) {
      // Remove user from likedBy
      resource.likedBy.splice(userLikedIndex, 1);
      resource.stats.likes = Math.max(0, (resource.stats.likes || 0) - 1); // Prevent negative likes
    }
    
    // Save the updated resource
    try {
      await resource.save();
    } catch (err) {
      console.error('Error saving resource:', err);
      return res.status(500).json({ error: 'Database error when saving resource' });
    }
    
    return res.status(200).json({ 
      success: true,
      message: shouldLike ? 'Resource liked' : 'Resource unliked',
      likesCount: resource.stats.likes || 0
    });
  } catch (error) {
    console.error('Error updating like status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}