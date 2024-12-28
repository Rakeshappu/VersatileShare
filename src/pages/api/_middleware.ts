import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '../../lib/db/connect';
import cors from 'cors';

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>

export const withDB = (handler: Handler) => async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await runCorsMiddleware(req, res);
    await connectDB()
    return handler(req, res)
  } catch (error) {
    console.error('API route error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse) {
    return new Promise((resolve, reject) => {
      corsMiddleware(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(result)
      })
    })
  }
  export function runCorsMiddleware(req: NextApiRequest, res: NextApiResponse) {
    return new Promise((resolve, reject) => {
      corsMiddleware(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
  }
  const corsMiddleware = cors({
    origin: 'http://localhost:5173', // Your Vite frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
  
  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res, corsMiddleware)
    return res
  }