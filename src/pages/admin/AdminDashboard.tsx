
import { useState, useEffect } from 'react';
import { Users, FileText, Upload, Download, Shield, Activity } from 'lucide-react';
import { ResourceUpload } from '../../components/faculty/ResourceUpload';
import { ResourceList } from '../../components/faculty/ResourceList';
import { UploadWorkflow } from '../../components/faculty/UploadWorkflow';
import { UploadFormData, FacultyResource } from '../../types/faculty';

// Access the shared resources
declare global {
  interface Window {
    sharedResources: FacultyResource[];
    subjectFolders: any[];
  }
}

// Initialize if needed
if (!window.sharedResources) {
  window.sharedResources = [];
}

if (!window.subjectFolders) {
  window.subjectFolders = [];
}

export const AdminDashboard = () => {
  const [resources, setResources] = useState<FacultyResource[]>(window.sharedResources);
  const [showUploadWorkflow, setShowUploadWorkflow] = useState(false);
  const [showResourceUpload, setShowResourceUpload] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'resources' | 'upload'>('dashboard');

  // Poll for updates to simulate real-time
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window.sharedResources !== resources) {
        setResources([...window.sharedResources]);
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [resources]);

  // Mock data for admin dashboard
  const stats = [
    { name: 'Total Users', value: '1,234', icon: <Users className="h-6 w-6 text-indigo-500" /> },
    { name: 'Total Files', value: resources.length.toString(), icon: <FileText className="h-6 w-6 text-green-500" /> },
    { name: 'Uploads Today', value: '89', icon: <Upload className="h-6 w-6 text-blue-500" /> },
    { name: 'Downloads Today', value: '213', icon: <Download className="h-6 w-6 text-yellow-500" /> }
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'uploaded', item: 'Advanced Calculus.pdf', time: '10 minutes ago' },
    { id: 2, user: 'Jane Smith', action: 'downloaded', item: 'Physics Notes.docx', time: '25 minutes ago' },
    { id: 3, user: 'Alex Johnson', action: 'deleted', item: 'Old Lecture Recordings', time: '1 hour ago' },
    { id: 4, user: 'Emma Wilson', action: 'shared', item: 'Computer Science Project', time: '2 hours ago' },
    { id: 5, user: 'Michael Brown', action: 'commented on', item: 'Machine Learning Notes', time: '3 hours ago' }
  ];

  const handleStartUpload = () => {
    setShowUploadWorkflow(true);
    setCurrentView('upload');
  };

  const handleSelectUploadOption = (option: string, data?: any) => {
    if (option === 'direct-upload') {
      setShowResourceUpload(true);
      setShowUploadWorkflow(false);
    } else if (option === 'create-subject-folders') {
      console.log('Creating subject folders:', data);
      
      if (data && data.subjects) {
        const newFolders = data.subjects.map((subject: any) => ({
          ...subject,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          resourceCount: 0
        }));
        
        window.subjectFolders = [
          ...(window.subjectFolders || []),
          ...newFolders
        ];
      }
      
      setShowUploadWorkflow(false);
      setShowResourceUpload(true);
    } else {
      console.log(`Selected option: ${option}`, data);
      setShowUploadWorkflow(false);
      setShowResourceUpload(true);
    }
  };

  const handleUpload = async (data: UploadFormData) => {
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
    
    // Update both local state and shared resources for real-time updates
    window.sharedResources = [newResource, ...window.sharedResources];
    setResources([newResource, ...resources]);
    setShowResourceUpload(false);
    setCurrentView('dashboard');
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
    // Admin would manage resources, not view analytics
    console.log(`View details for resource ${resourceId}`);
  };

  const handleGoBack = () => {
    setShowUploadWorkflow(false);
    setShowResourceUpload(false);
    setCurrentView('dashboard');
  };

  return (
    <div className="container mx-auto p-6">
      {currentView === 'dashboard' && (
        <>
          <div className="flex items-center mb-6">
            <Shield className="mr-2 text-indigo-500" size={24} />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {stat.icon}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button 
              onClick={handleStartUpload}
              className="flex items-center justify-center p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Upload className="mr-2" size={20} />
              Upload New Content
            </button>
            <button 
              className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => setCurrentView('resources')}
            >
              <FileText className="mr-2" size={20} />
              Manage Resources
            </button>
            <button className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Users className="mr-2" size={20} />
              Manage Users
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 flex items-center">
              <Activity className="mr-2 text-indigo-500" size={20} />
              <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Recent Activity
              </h2>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <ul>
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <span className="font-semibold">{activity.user}</span> {activity.action} <span className="text-indigo-600 dark:text-indigo-400">{activity.item}</span>
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </p>
                      </div>
                      <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Subject Folders Section */}
          {window.subjectFolders && window.subjectFolders.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="mr-2 text-indigo-500" size={20} />
                  <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    Available Subject Folders
                  </h2>
                </div>
                <span className="text-sm text-gray-500">{window.subjectFolders.length} folders</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {window.subjectFolders.map((folder, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{folder.subjectName}</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <p>Lecturer: {folder.lecturerName}</p>
                        <p>Semester: {folder.semester}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {currentView === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleGoBack}
              className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-2"
            >
              <span>← Back to Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Resources</h1>
          </div>
          
          <ResourceList
            resources={resources}
            onViewAnalytics={handleViewAnalytics}
            showDeleteButton={true}
          />
        </div>
      )}

      {currentView === 'upload' && (
        <div className="space-y-4">
          <button
            onClick={handleGoBack}
            className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center space-x-2"
          >
            <span>← Back to Dashboard</span>
          </button>
          
          {showUploadWorkflow && (
            <UploadWorkflow 
              onSelectOption={handleSelectUploadOption} 
              onCancel={handleGoBack}
              showAvailableSubjects={true}
            />
          )}
          
          {showResourceUpload && (
            <ResourceUpload onUpload={handleUpload} />
          )}
        </div>
      )}
    </div>
  );
};
