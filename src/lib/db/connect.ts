
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/versatile-share';

// Clear the mongoose connection cache
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialize global mongoose object if not present
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

let cached = global.mongoose;

async function connectDB() {
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Connecting to MongoDB:', MONGODB_URI);
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('New MongoDB connection established');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

// Add a simple verification function
export async function verifyDbConnection() {
  try {
    await connectDB();
    // Check the connection state
    const connectionState = mongoose.connection.readyState;
    
    switch (connectionState) {
      case 0:
        return { connected: false, message: 'MongoDB disconnected' };
      case 1:
        return { connected: true, message: 'MongoDB connected' };
      case 2:
        return { connected: false, message: 'MongoDB connecting' };
      case 3:
        return { connected: false, message: 'MongoDB disconnecting' };
      default:
        return { connected: false, message: 'Unknown MongoDB connection state' };
    }
  } catch (error) {
    console.error('MongoDB verification error:', error);
    return { connected: false, message: String(error) };
  }
}

export { mongoose };
export default connectDB;
