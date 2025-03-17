
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyDbConnection } from '../../../lib/db/connect';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const status = await verifyDbConnection();
    
    // Add additional information about the MongoDB server if connected
    let serverInfo = {};
    if (status.connected) {
      const mongoose = await import('mongoose');
      serverInfo = {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        port: mongoose.connection.port,
        models: Object.keys(mongoose.models)
      };
    }
    
    return res.status(200).json({
      ...status,
      timestamp: new Date().toISOString(),
      serverInfo
    });
  } catch (error) {
    console.error('Error checking database status:', error);
    return res.status(500).json({ 
      connected: false, 
      error: 'Failed to check database connection',
      details: String(error)
    });
  }
}
