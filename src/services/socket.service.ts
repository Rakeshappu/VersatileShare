
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  // Initialize socket connection
  connect(token: string) {
    if (this.socket && this.socket.connected) {
      return;
    }

    // Create socket connection
    this.socket = io(
      process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000'
        : window.location.origin,
      {
        auth: { token },
        withCredentials: true,
      }
    );

    // Set up default listeners
    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
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
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a resource room to receive updates
  joinResource(resourceId: string) {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('join-resource', resourceId);
  }

  // Leave a resource room
  leaveResource(resourceId: string) {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('leave-resource', resourceId);
  }

  // Send resource update
  sendResourceUpdate(resourceId: string, updateData: any) {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected');
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
