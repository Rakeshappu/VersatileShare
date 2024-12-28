import React, { useState } from 'react';
import { ResourceUpload } from '../../components/faculty/ResourceUpload';
import { ResourceList } from '../../components/faculty/ResourceList';
import { ResourceAnalyticsView } from '../../components/faculty/ResourceAnalytics';
import { UploadFormData, FacultyResource, ResourceAnalytics } from '../../types/faculty';

// Mock data - Replace with actual API calls
const mockResources: FacultyResource[] = [
  {
    id: '1',
    title: 'Introduction to Data Structures',
    description: 'Comprehensive guide to basic data structures',
    type: 'document',
    subject: 'Data Structures',
    semester: 3,
    uploadDate: '2024-03-20',
    stats: {
      views: 1250,
      likes: 45,
      comments: 12,
      downloads: 89,
      lastViewed: '2024-03-20'
    }
  },
  // Add more mock resources...
];

const mockAnalytics: ResourceAnalytics = {
  views: 1250,
  likes: 45,
  comments: 12,
  downloads: 89,
  lastViewed: '2024-03-20',
  dailyViews: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    count: Math.floor(Math.random() * 100)
  })),
  topDepartments: [
    { name: 'Computer Science', count: 450 },
    { name: 'Information Science', count: 450 },
    { name: 'Electronics & Communication', count: 320 },
    { name: 'Electrics', count: 320 },
    { name: 'Mechanical', count: 280 },
    { name: 'Civil', count: 200 }
  ],
  studentFeedback: [
    { rating: 5, count: 25 },
    { rating: 4, count: 15 },
    { rating: 3, count: 8 },
    { rating: 2, count: 3 },
    { rating: 1, count: 1 }
  ]
};

export const FacultyDashboard = () => {
  const [resources, setResources] = useState<FacultyResource[]>(mockResources);
  const [selectedResource, setSelectedResource] = useState<FacultyResource | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleUpload = async (data: UploadFormData) => {
    // Here you would typically make an API call to upload the resource
    console.log('Uploading resource:', data);
    
    // Mock implementation
    const newResource: FacultyResource = {
      id: Date.now().toString(),
      ...data,
      uploadDate: new Date().toISOString(),
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
        downloads: 0,
        lastViewed: new Date().toISOString()
      }
    };
    
    setResources([newResource, ...resources]);
  };

  const handleViewAnalytics = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      setSelectedResource(resource);
      setShowAnalytics(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <ResourceUpload onUpload={handleUpload} />
        
        {showAnalytics && selectedResource ? (
          <>
            <button
              onClick={() => setShowAnalytics(false)}
              className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center space-x-2"
            >
              <span>← Back to Resources</span>
            </button>
            <ResourceAnalyticsView
              analytics={mockAnalytics}
              resourceTitle={selectedResource.title}
            />
          </>
        ) : (
          <ResourceList
            resources={resources}
            onViewAnalytics={handleViewAnalytics}
          />
        )}
      </div>
    </div>
  );
};