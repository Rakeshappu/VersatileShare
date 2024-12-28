import { User, Activity, Resource } from '../types';

export const currentUser: User = {
  id: '1',
  name: 'Varun Bharadwaj',
  semester: 7,
  department: 'Information Science & Engineering',
  streak: 5,
  lastActive: '2024-03-20',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
};

export const categories = [
  'Placement Preparation',
  'Competitive Programming',
  'Interview Questions',
  'Project Ideas',
  'Research Papers',
  'Study Materials'
];

export const resources: Resource[] = [
  {
    id: '1',
    title: 'Data Structures and Algorithms',
    description: 'Comprehensive guide to DSA concepts',
    type: 'pdf',
    semester: 4,
    subject: 'Data Structures',
    uploadedBy: 'Prof. Smith',
    views: 1200,
    downloads: 450,
    category: 'Study Materials',
    timestamp: '2024-03-15'
  },
  {
    id: '2',
    title: 'System Design Interview Prep',
    description: 'Essential system design patterns and examples',
    type: 'video',
    semester: 4,
    subject: 'Software Engineering',
    uploadedBy: 'Prof. Johnson',
    views: 800,
    downloads: 320,
    category: 'Placement Preparation',
    timestamp: '2024-03-18'
  },
  {
    id: '3',
    title: 'Database Management Notes',
    description: 'Complete DBMS concepts and SQL queries',
    type: 'document',
    semester: 4,
    subject: 'Database Management',
    uploadedBy: 'Prof. Davis',
    views: 950,
    downloads: 410,
    category: 'Study Materials',
    timestamp: '2024-03-19'
  },
  {
    id: '4',
    title: 'Competitive Programming Guide',
    description: 'Advanced algorithms and problem-solving techniques',
    type: 'pdf',
    semester: 4,
    subject: 'Competitive Programming',
    uploadedBy: 'Prof. Wilson',
    views: 1500,
    downloads: 680,
    category: 'Competitive Programming',
    timestamp: '2024-03-20'
  }
];

export const recentActivities: Activity[] = [
  {
    id: '1',
    type: 'complete',
    description: 'Completed DSA Practice Set',
    timestamp: '2024-03-20T10:30:00',
    points: 50
  },
  {
    id: '2',
    type: 'streak',
    description: '5 Day Learning Streak!',
    timestamp: '2024-03-20T00:00:00',
    points: 100
  },
  {
    id: '3',
    type: 'download',
    description: 'Downloaded System Design Interview Prep',
    timestamp: '2024-03-19T15:45:00',
    points: 25
  },
  {
    id: '4',
    type: 'view',
    description: 'Viewed Database Management Notes',
    timestamp: '2024-03-19T14:20:00',
    points: 10
  }
];