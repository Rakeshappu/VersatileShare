
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private reconnectDelay = 2000; // 2 seconds

  // Initialize socket connection
  connect(token: string) {
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected');
      return;
    }

    // Create socket connection
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? window.location.hostname + ':3000'
      : window.location.origin;
    
    console.log(`Connecting to socket server at: ${baseUrl}`);
    
    try {
      this.socket = io(`http://${baseUrl}`, {
        auth: { token },
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      // Set up default listeners
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.connectionAttempts = 0;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        this.handleConnectionError();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
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
