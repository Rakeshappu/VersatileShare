
import { Server } from 'socket.io';
import { verifyToken } from '../auth/jwt';

let io: Server;

export const initializeSocketIO = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:8080'],
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Authorization']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
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
