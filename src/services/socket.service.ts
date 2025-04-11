import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private reconnectDelay = 2000; // 2 seconds
  private notificationsQueue: any[] = [];

  // Initialize socket connection
  connect(token: string) {
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected');
      this.processNotificationQueue();
      return;
    }

    // Create socket connection
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? window.location.hostname
      : window.location.origin;
    
    const port = process.env.NODE_ENV === 'development' ? '8080' : '';
    const socketUrl = process.env.NODE_ENV === 'development'
      ? `http://${baseUrl}:${port}`
      : baseUrl;
    
    console.log(`Connecting to socket server at: ${socketUrl}`);
    
    try {
      this.socket = io(socketUrl, {
        auth: { token },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000, // Increase timeout to 20 seconds
        path: '/socket.io'
      });

      // Set up default listeners
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.connectionAttempts = 0;
        this.processNotificationQueue();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        this.handleConnectionError();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
      
      // Listen for resource upload notifications with more detailed logging
      this.socket.on('new-resource', (data) => {
        console.log('New resource notification received:', data);
        
        // Add more detailed logging to debug notification issues
        if (!data) {
          console.error('Empty notification data received');
        } else if (!data.message) {
          console.error('Notification received but missing message field:', data);
        }
        
        this.showNotification({
          title: 'New Resource Available',
          message: data.message || `New resource "${data.resource?.title || 'Untitled'}" is available`,
          resourceId: data.resource?._id
        });
      });
      
      // Listen for resource interaction notifications (for faculty)
      this.socket.on('resource-interaction', (data) => {
        console.log('Resource interaction notification received:', data);
        this.showNotification({
          title: data.interactionType === 'like' ? 'New Like' : 'New Comment',
          message: data.message,
          resourceId: data.resourceId
        });
      });

      // Re-add all existing event listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket?.on(event, callback);
        });
      });
    } catch (error) {
      console.error('Socket initialization error:', error);
      this.handleConnectionError();
    }
  }
  
  // Process any queued notifications after connection is established
  private processNotificationQueue() {
    if (this.notificationsQueue.length > 0 && this.socket?.connected) {
      console.log(`Processing ${this.notificationsQueue.length} queued notifications`);
      this.notificationsQueue.forEach(notification => {
        this.showNotification(notification);
      });
      this.notificationsQueue = [];
    }
  }
  
  // Show browser notification for new resources
  private showNotification(data: { title: string, message: string, resourceId?: string }) {
    // If socket isn't connected, queue the notification for later
    if (!this.socket?.connected) {
      console.log('Socket not connected, queueing notification:', data);
      this.notificationsQueue.push(data);
      return;
    }
    
    console.log('Displaying notification:', data);
    
    // Show toast notification
    toast.success(data.message, {
      duration: 5000
    });
    
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }
    
    // Check if permission is already granted
    if (Notification.permission === "granted") {
      this.createNotification(data);
    } 
    // Otherwise, ask for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          this.createNotification(data);
        }
      });
    }
  }
  
  // Create the actual notification
  private createNotification(data: { title: string, message: string, resourceId?: string }) {
    const notification = new Notification(data.title, {
      body: data.message,
      icon: '/favicon.ico'
    });
    
    notification.onclick = function() {
      window.focus();
      notification.close();
      // Navigate to the resource if resourceId is provided
      if (data.resourceId) {
        window.location.href = `/resources/${data.resourceId}`;
      }
    };
  }

  // Handle connection errors with retry logic
  private handleConnectionError() {
    this.connectionAttempts++;
    
    if (this.connectionAttempts < this.maxConnectionAttempts) {
      console.log(`Retrying connection (attempt ${this.connectionAttempts} of ${this.maxConnectionAttempts})...`);
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) this.connect(token);
      }, this.reconnectDelay);
    } else {
      console.log('Max connection attempts reached. Socket functionality disabled.');
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected by client');
    }
  }

  // Join a resource room to receive updates
  joinResource(resourceId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected. Cannot join resource room.');
      return;
    }

    this.socket.emit('join-resource', resourceId);
  }

  // Leave a resource room
  leaveResource(resourceId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected. Cannot leave resource room.');
      return;
    }

    this.socket.emit('leave-resource', resourceId);
  }

  // Send resource update
  sendResourceUpdate(resourceId: string, updateData: any) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected. Cannot send resource update.');
      return;
    }

    this.socket.emit('resource-update', { resourceId, ...updateData });
  }
  
  // Function to send notification to a specific semester
  emitToSemester(semester: number, event: string, data: any) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected. Cannot emit to semester.');
      return;
    }
    
    // We'll rely on the server-side implementation to route this to the right students
    this.socket.emit('semester-notification', { semester, event, data });
  }

  // Listen for events
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)?.add(callback);
    
    if (this.socket) {
      this.socket.on(event, callback);
    }

    return () => this.off(event, callback);
  }

  // Remove event listener
  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Check if socket is connected
  isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
