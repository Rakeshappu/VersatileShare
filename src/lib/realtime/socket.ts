import { Server } from 'socket.io';
import { verifyToken } from '../auth/jwt';
import mongoose from 'mongoose';
import { Resource } from '../db/models/Resource';
import { User } from '../db/models/User';
import { Notification } from '../db/models/Notification';

let io: Server;

export const initializeSocketIO = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:8080'],
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Authorization']
    },
    path: '/socket.io'
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decodedToken = verifyToken(token);
      if (!decodedToken) {
        return next(new Error('Invalid token'));
      }
      
      // Attach user data to socket
      socket.data.user = decodedToken;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user.id}`);
    
    // Join user-specific room
    socket.join(`user:${socket.data.user.id}`);
    
    // Join department room if applicable
    if (socket.data.user.department) {
      socket.join(`department:${socket.data.user.department}`);
    }
    
    // Join semester room for students
    if (socket.data.user.role === 'student' && socket.data.user.semester) {
      socket.join(`semester:${socket.data.user.semester}`);
      console.log(`Student ${socket.data.user.id} joined semester:${socket.data.user.semester}`);
    }

    // Handle events
    socket.on('join-resource', (resourceId) => {
      socket.join(`resource:${resourceId}`);
    });

    socket.on('leave-resource', (resourceId) => {
      socket.leave(`resource:${resourceId}`);
    });

    socket.on('resource-update', (data) => {
      socket.to(`resource:${data.resourceId}`).emit('resource-updated', data);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
    });
  });

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit events to specific users, departments, or all users
export const emitToUser = (userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToDepartment = (department: string, event: string, data: any) => {
  io.to(`department:${department}`).emit(event, data);
};

export const emitToAllUsers = (event: string, data: any) => {
  io.emit(event, data);
};

export const emitToSemester = (semester: number, event: string, data: any) => {
  console.log(`Emitting to semester:${semester} - Event: ${event}`);
  io.to(`semester:${semester}`).emit(event, data);
};

// Send resource upload notification to students in a specific semester
export const notifyResourceUpload = async (resourceId: string, facultyName: string, resourceTitle?: string, specificSemester?: string | number) => {
  try {
    if (!mongoose.isValidObjectId(resourceId)) {
      console.error('Invalid resource ID:', resourceId);
      return;
    }
    
    // Get resource details
    let resource;
    try {
      resource = await Resource.findById(resourceId);
      
      if (!resource) {
        console.error('Resource not found:', resourceId);
        return;
      }
    } catch (error) {
      console.error('Error finding resource:', error);
      return;
    }
    
    let targetSemester: number;
    
    // If specificSemester was provided (from API), use it
    if (specificSemester !== undefined) {
      targetSemester = Number(specificSemester);
    } else {
      // Otherwise use the semester from the resource
      targetSemester = resource.semester;
    }
    
    console.log(`Processing notification for resource in semester ${targetSemester}`);
    
    if (targetSemester === undefined && targetSemester !== 0) {
      console.error('Resource has no semester information:', resourceId);
      return; // Skip if no semester info
    }
    
    // For placement resources (semester 0), notify all students
    if (targetSemester === 0) {
      console.log('Sending placement resource notification to all students');
      // Create notification message
      const resourceTitleToUse = resourceTitle || resource.title;
      const notificationMessage = `New placement resource "${resourceTitleToUse}" uploaded by ${facultyName}`;
      
      // Emit to all users
      io.emit('new-resource', {
        message: notificationMessage,
        resource: {
          _id: resource._id,
          title: resourceTitleToUse,
          subject: resource.subject,
          semester: resource.semester,
          type: resource.type,
          uploadedBy: facultyName
        },
        timestamp: new Date()
      });
      
      // Store notifications for all students
      try {
        const students = await User.find({ role: 'student' });
        console.log(`Found ${students.length} students for placement notification`);
        
        const resourceObjectId = new mongoose.Types.ObjectId(resourceId);
        
        const notificationObjects = students.map(student => ({
          userId: student._id,
          message: notificationMessage,
          resourceId: resourceObjectId,
          read: false,
          createdAt: new Date()
        }));
        
        if (notificationObjects.length > 0) {
          await Notification.insertMany(notificationObjects);
          console.log(`Created ${notificationObjects.length} notifications for placement resource ${resourceTitleToUse}`);
        }
      } catch (error) {
        console.error('Error creating placement notifications:', error);
      }
      
      return;
    }
    
    // Faculty name from parameter
    const uploaderName = facultyName || 'Faculty';
    
    // Resource title from parameter or database
    const resourceTitleToUse = resourceTitle || resource.title;
    
    // Create notification message
    const notificationMessage = `New resource "${resourceTitleToUse}" uploaded by ${uploaderName} for semester ${targetSemester}`;
    
    console.log(`Preparing to send notification ONLY to semester ${targetSemester} students:`, notificationMessage);
    
    // STRICTLY send notifications ONLY to students in that specific semester
    emitToSemester(targetSemester, 'new-resource', {
      message: notificationMessage,
      resource: {
        _id: resource._id,
        title: resourceTitleToUse,
        subject: resource.subject,
        semester: resource.semester,
        type: resource.type,
        uploadedBy: uploaderName
      },
      timestamp: new Date()
    });
    
    // Also store the notification in the database ONLY for students in this semester
    try {
      // Get all students in this specific semester
      const students = await User.find({ 
        role: 'student', 
        semester: targetSemester 
      });
      const resourceObjectId = new mongoose.Types.ObjectId(resourceId);
      
      console.log(`Found ${students.length} students in semester ${targetSemester}`);
      
      // Create notifications in bulk
      const notificationObjects = students.map(student => ({
        userId: student._id,
        message: notificationMessage,
        resourceId: resourceObjectId,
        read: false,
        createdAt: new Date()
      }));
      
      // Use the Notification model to create all notifications at once
      if (notificationObjects.length > 0) {
        await Notification.insertMany(notificationObjects);
        console.log(`Created ${notificationObjects.length} notifications in the database for semester ${targetSemester}`);
      }
      
      console.log(`Notifications sent to ${students.length} students for resource ${resourceTitleToUse}`);
    } catch (error) {
      console.error('Error creating notifications:', error);
    }
  } catch (error) {
    console.error('Error sending resource notification:', error);
  }
};

// Notify faculty when a student interacts with their resource
export const notifyFacultyOfInteraction = async (
  resourceId: string, 
  studentId: string, 
  interactionType: 'like' | 'comment', 
  commentContent?: string
) => {
  try {
    if (!mongoose.isValidObjectId(resourceId) || !mongoose.isValidObjectId(studentId)) {
      console.error('Invalid resource or student ID');
      return;
    }
    
    // Get resource and student details
    let resource, student;
    
    try {
      resource = await Resource.findById(resourceId);
      student = await User.findById(studentId);
      
      if (!resource || !resource.uploadedBy || !student) {
        console.error('Resource, faculty, or student not found');
        return;
      }
    } catch (error) {
      console.error('Error finding resource or student:', error);
      return;
    }
    
    // Get faculty ID (the resource uploader)
    const facultyId = resource.uploadedBy.toString();
    
    // Prepare notification message
    let notificationMessage = '';
    if (interactionType === 'like') {
      notificationMessage = `${student.fullName} liked your resource "${resource.title}"`;
    } else if (interactionType === 'comment') {
      notificationMessage = `${student.fullName} commented on your resource "${resource.title}": ${commentContent?.substring(0, 50)}${commentContent && commentContent.length > 50 ? '...' : ''}`;
    }
    
    // Create notification in database
    try {
      await Notification.create({
        userId: facultyId,
        message: notificationMessage,
        resourceId: resource._id,
        read: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
    
    // Send real-time notification
    emitToUser(facultyId, 'resource-interaction', {
      message: notificationMessage,
      resourceId: resource._id,
      interactionType,
      student: {
        id: student._id,
        name: student.fullName
      },
      timestamp: new Date()
    });
    
    console.log(`Notification sent to faculty ${facultyId} for ${interactionType} by student ${student.fullName}`);
  } catch (error) {
    console.error(`Error notifying faculty of ${interactionType}:`, error);
  }
};
