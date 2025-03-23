
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/db/connect';
import { Resource } from '../../../../lib/db/models/Resource';
import { User } from '../../../../lib/db/models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    await connectDB();
    
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Resource ID is required' });
    }
    
    // For GET requests, return comments for the resource
    if (req.method === 'GET') {
      try {
        // We'd ideally have a Comment model, but for now we can simulate comments
        // In a real app, you would fetch comments from a Comments collection
        
        // Simulate comments for demonstration
        const commentsData = Array.from({ length: 5 }, (_, i) => ({
          _id: new mongoose.Types.ObjectId().toString(),
          resourceId: id,
          content: `This is a sample comment ${i + 1} for this resource. Very helpful!`,
          author: {
            _id: new mongoose.Types.ObjectId().toString(),
            fullName: `User ${i + 1}`,
            email: `user${i + 1}@example.com`
          },
          createdAt: new Date(Date.now() - i * 3600000).toISOString()
        }));
        
        return res.status(200).json({
          success: true,
          comments: commentsData
        });
      } catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ error: 'Failed to fetch comments' });
      }
    }
    
    // For POST requests, add a new comment
    if (req.method === 'POST') {
      try {
        // Get authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        
        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        // Get comment content
        const { content } = req.body;
        if (!content || typeof content !== 'string') {
          return res.status(400).json({ error: 'Comment content is required' });
        }
        
        // Find resource and update its comment count
        const resource = await Resource.findById(id);
        if (!resource) {
          return res.status(404).json({ error: 'Resource not found' });
        }
        
        resource.stats.comments += 1;
        await resource.save();
        
        // In a real app, you would create a new comment in the Comments collection
        // For now, just return a success response with the new comment
        
        const newComment = {
          _id: new mongoose.Types.ObjectId().toString(),
          resourceId: id,
          content,
          author: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email
          },
          createdAt: new Date().toISOString()
        };
        
        return res.status(201).json({
          success: true,
          message: 'Comment added successfully',
          comment: newComment
        });
      } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ error: 'Failed to add comment' });
      }
    }
    
    // If not GET or POST, return method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Comments API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
