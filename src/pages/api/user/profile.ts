
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/db/connect';
import { User } from '../../../lib/db/models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await connectDB();
    
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
    
    console.log('Profile update request received:', req.body);
    
    // Update user fields
    const { fullName, phoneNumber, department, avatar, gender, batch, degree } = req.body;
    
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (department) user.department = department;
    if (avatar) user.avatar = avatar;
    if (gender) user.gender = gender;
    if (batch) user.batch = batch;
    if (degree) user.degree = degree;
    
    console.log('Updating user profile with data:', { 
      fullName, phoneNumber, department, 
      avatarProvided: !!avatar,
      gender, batch, degree
    });
    
    await user.save();
    console.log('User profile saved successfully');
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        gender: user.gender,
        batch: user.batch,
        degree: user.degree,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
