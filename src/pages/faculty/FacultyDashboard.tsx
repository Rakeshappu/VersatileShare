
import { useState, useEffect } from 'react';
import { ResourceUpload } from '../../components/faculty/ResourceUpload';
import { ResourceList } from '../../components/faculty/ResourceList';
import { ResourceAnalyticsView } from '../../components/faculty/ResourceAnalytics';
import { UploadFormData, FacultyResource, ResourceAnalytics } from '../../types/faculty';
import { UploadWorkflow } from '../../components/faculty/UploadWorkflow';

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

// Initialize shared storage for real-time updates between faculty and student views
if (!window.sharedResources) {
  window.sharedResources = [...mockResources];
}

if (!window.subjectFolders) {
  window.subjectFolders = [];
}

export const FacultyDashboard = () => {
  const [resources, setResources] = useState<FacultyResource[]>(window.sharedResources);
  const [selectedResource, setSelectedResource] = useState<FacultyResource | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showUploadWorkflow, setShowUploadWorkflow] = useState(false);
  const [showResourceUpload, setShowResourceUpload] = useState(false);

  // Poll for updates to simulate real-time
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window.sharedResources !== resources) {
        setResources([...window.sharedResources]);
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [resources]);

  const handleUpload = async (data: UploadFormData) => {
    // Here you would typically make an API call to upload the resource
    console.log('Uploading resource:', data);
    
    // For file uploads, read the file content to make it accessible
    let fileContent = '';
    let fileName = '';
    
    if (data.file) {
      fileName = data.file.name;
      
      // Read file data to store it
      if (data.type !== 'link') {
        try {
          fileContent = await readFileAsBase64(data.file);
        } catch (error) {
          console.error('Error reading file:', error);
        }
      }
    }
    
    // Mock implementation
    const newResource: FacultyResource = {
      id: Date.now().toString(),
      ...data,
      uploadDate: new Date().toISOString(),
      fileName: fileName,
      fileContent: fileContent,
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
        downloads: 0,
        lastViewed: new Date().toISOString()
      }
    };
    
    // Update both local state and shared resources
    window.sharedResources = [newResource, ...window.sharedResources];
    setResources([newResource, ...resources]);
    setShowResourceUpload(false);
  };

  // Function to read file as base64 string
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleViewAnalytics = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      setSelectedResource(resource);
      setShowAnalytics(true);
    }
  };

  const handleStartUpload = () => {
    setShowUploadWorkflow(true);
  };

  const handleSelectUploadOption = (option: string, data?: any) => {
    if (option === 'direct-upload') {
      setShowResourceUpload(true);
      setShowUploadWorkflow(false);
    } else if (option === 'create-subject-folders') {
      console.log('Creating subject folders:', data);
      
      // Store subject folders for later use
      if (!window.subjectFolders) {
        window.subjectFolders = [];
      }
      
      if (data && data.subjects) {
        const newFolders = data.subjects.map((subject: any) => ({
          ...subject,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          resourceCount: 0
        }));
        
        window.subjectFolders = [
          ...window.subjectFolders,
          ...newFolders
        ];
      }
      
      setShowUploadWorkflow(false);
      setShowResourceUpload(true);
    } else {
      // For subject folder creation or other options,
      // we would handle the data differently
      console.log(`Selected option: ${option}`, data);
      setShowUploadWorkflow(false);
      // Here you would typically create folders or set up the structure
      // For now, we'll just show the regular upload form
      setShowResourceUpload(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {!showUploadWorkflow && !showResourceUpload && !showAnalytics && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleStartUpload}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Upload Content
            </button>
          </div>
        )}
        
        {showUploadWorkflow && (
          <UploadWorkflow 
            onSelectOption={handleSelectUploadOption} 
            onCancel={() => setShowUploadWorkflow(false)} 
            showAvailableSubjects={true}
          />
        )}
        
        {showResourceUpload && (
          <>
            <button
              onClick={() => setShowResourceUpload(false)}
              className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center space-x-2"
            >
              <span>← Back to Resources</span>
            </button>
            <ResourceUpload 
              onUpload={handleUpload} 
              initialSubject={selectedResource?.subject}
              initialSemester={selectedResource?.semester}
            />
          </>
        )}
        
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
        ) : !showUploadWorkflow && !showResourceUpload && (
          <ResourceList
            resources={resources}
            onViewAnalytics={handleViewAnalytics}
          />
        )}
      </div>
    </div>
  );
};
