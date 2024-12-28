export interface User {
  id: string;
  name: string;
  semester: number;
  department: string;
  streak: number;
  lastActive: string;
  avatar?: string;
}

export interface SearchFilters {
  query: string;
  type?: string[];
  semester?: number;
  subject?: string;
  category?: string[];
}

export interface Activity {
  id: string;
  type: 'view' | 'download' | 'complete' | 'streak';
  description: string;
  timestamp: string;
  points: number;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  semester: number;
  subject: string;
  uploadedBy: string;
  views: number;
  downloads: number;
  category: string;
  timestamp: string;
}