export interface ResourceStats {
  views: number;
  likes: number;
  comments: number;
  downloads: number;
  lastViewed: string;
}

export interface ResourceAnalytics extends ResourceStats {
  dailyViews: { date: string; count: number }[];
  topDepartments: { name: string; count: number }[];
  studentFeedback: { rating: number; count: number }[];
}

export interface FacultyResource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'note' | 'link';
  subject: string;
  semester: number;
  uploadDate: string;
  fileUrl?: string;
  fileSize?: number;
  stats: ResourceStats;
}

export interface UploadFormData {
  title: string;
  description: string;
  type: FacultyResource['type'];
  subject: string;
  semester: number;
  file?: File;
  link?: string;
}