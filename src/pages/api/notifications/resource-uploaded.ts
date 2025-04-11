
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/db/connect';
import { notifyResourceUpload } from '../../../lib/realtime/socket';
import jwt from 'jsonwebtoken';
import { User } from '../../../lib/db/models/User';
import { Notification } from '../../../lib/db/models/Notification';

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
    
    // Verify the user is a faculty member
    if (user.role !== 'faculty' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Only faculty members can send resource notifications' });
    }
    
    const { resourceId, facultyName, resourceTitle, semester } = req.body;
    
    if (!resourceId) {
      return res.status(400).json({ error: 'Resource ID is required' });
    }
     // Find students in the specified semester
     const targetStudents = await User.find({ 
      role: 'student',
      ...(semester ? { semester: semester } : {})
    });
    console.log(`API route: sending notification for resource ${resourceId} by ${facultyName || user.fullName} for semester ${semester}`);
    
    // Create notifications in database for each student
    const notificationPromises = targetStudents.map(student => {
      return Notification.createNotification({
        userId: student._id,
        message: `New resource "${resourceTitle || 'Untitled'}" uploaded by ${facultyName || user.fullName}`,
        resourceId
      });
    });
    
    await Promise.all(notificationPromises);
    console.log(`Created ${notificationPromises.length} notifications in database`);
    
    // Send real-time notification to students - Now specifically passing the semester parameter
    try {
      // We add await here to make sure the promise is resolved
      await notifyResourceUpload(resourceId, facultyName || user.fullName, resourceTitle, semester);
      console.log(`Real-time notification sent successfully for resource ${resourceId} to semester ${semester}`);
    } catch (error) {
      console.error('Error in notifyResourceUpload:', error);
      return res.status(500).json({ 
        error: 'Failed to send real-time notification',
        details: (error as Error).message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `Notification sent successfully to semester ${semester || 'all'}`,
    });
  } catch (error) {
    console.error('Error sending resource notification:', error);
    return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
}
