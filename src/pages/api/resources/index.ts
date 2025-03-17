
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/db/connect';
import { Resource } from '../../../lib/db/models/Resource';
import { verifyToken } from '../../../lib/auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    
    // Check auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const userData = verifyToken(token);
    if (!userData) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    switch (req.method) {
      case 'GET':
        return getResources(req, res, userData.id);
      case 'POST':
        return createResource(req, res, userData.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Resource API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getResources(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { semester, subject, type } = req.query;
  
  const query: any = {};
  
  if (semester) query.semester = parseInt(semester as string);
  if (subject) query.subject = subject;
  if (type) query.type = type;
  
  const resources = await Resource.find(query)
    .sort({ createdAt: -1 })
    .populate('uploadedBy', 'fullName')
    .limit(50);
  
  return res.status(200).json({ resources });
}

async function createResource(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { title, description, type, subject, semester, fileUrl, fileSize, link } = req.body;
  
  if (!title || !description || !type || !subject || !semester) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (type === 'link' && !link) {
    return res.status(400).json({ error: 'Link is required for link type resources' });
  }
  
  if ((type === 'document' || type === 'video') && !fileUrl) {
    return res.status(400).json({ error: 'File URL is required for document and video resources' });
  }
  
  const resource = new Resource({
    title,
    description,
    type,
    subject,
    semester,
    uploadedBy: userId,
    fileUrl,
    fileSize,
    link,
    stats: {
      views: 0,
      likes: 0,
      comments: 0,
      downloads: 0,
    },
  });
  
  await resource.save();
  
  return res.status(201).json({ resource });
}
