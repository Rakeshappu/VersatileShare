
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Handle React Router DOM context errors specifically
  if (err.message && (
    err.message.includes('React.useContext') ||
    err.message.includes('useContext(...)') ||
    err.message.includes('basename') ||
    err.message.includes('Cannot destructure property') ||
    err.message.includes('React__namespace.useContext')
  )) {
    console.log('Handling React Router DOM context error');
    return res.status(200).json({ 
      error: false,
      message: 'Client-side rendering required',
      data: null
    });
  }
  
  res.status(500).json({ error: 'Internal server error' });
};
