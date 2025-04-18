import { useState, useEffect } from 'react';
import { Users, FileText, Upload, Download, Shield, Activity, PieChart } from 'lucide-react';
import { ResourceUpload } from '../../components/faculty/ResourceUpload';
import { ResourceList } from '../../components/faculty/ResourceList';
import { UploadWorkflow } from '../../components/faculty/UploadWorkflow';
import { UploadFormData, FacultyResource } from '../../types/faculty';
import { AnalyticsCard } from '../../components/analytics/AnalyticsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Access the shared resources
declare global {
  interface Window {
    sharedResources: FacultyResource[];
    subjectFolders: any[];
  }
}

// Initialize if needed
if (typeof window !== 'undefined') {
  if (!window.sharedResources) {
    window.sharedResources = [];
  }

  if (!window.subjectFolders) {
    window.subjectFolders = [];
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export const AdminDashboard = () => {
  const [resources, setResources] = useState<FacultyResource[]>(typeof window !== 'undefined' ? window.sharedResources : []);
  const [showUploadWorkflow, setShowUploadWorkflow] = useState(false);
  const [showResourceUpload, setShowResourceUpload] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'resources' | 'upload'>('dashboard');
  const [analytics, setAnalytics] = useState({
    users: { total: 0, loading: true },
    resources: { total: 0, loading: true },
    activity: { total: 0, loading: true },
    departments: { data: [] as { name: string; value: number }[], loading: true },
    resourceTypes: { data: [] as { name: string; value: number }[], loading: true },
    dailyActivity: { data: [] as { name: string; uploads: number; downloads: number; views: number }[], loading: true }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    uploads: 0,
    downloads: 0
  });

  // Fetch real analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch users count by role
        const usersResponse = await api.get('/api/user/stats');
        
        // Fetch resources stats
        const resourcesResponse = await api.get('/api/resources/stats');
        
        // Fetch activity stats
        const activityResponse = await api.get('/api/user/activity/stats');
        
        // Calculate today's uploads and downloads
        const today = new Date().toISOString().split('T')[0];
        
        let todayUploads = 0;
        let todayDownloads = 0;
        
        if (resourcesResponse.data?.dailyStats) {
          const todayStat = resourcesResponse.data.dailyStats.find((stat: any) => 
            new Date(stat.date).toISOString().split('T')[0] === today
          );
          
          if (todayStat) {
            todayUploads = todayStat.uploads || 0;
            todayDownloads = todayStat.downloads || 0;
          }
        }
        
        setTodayStats({
          uploads: todayUploads,
          downloads: todayDownloads
        });
        
        // Update analytics state with real data
        setAnalytics({
          users: { 
            total: usersResponse.data?.totalUsers || 0, 
            loading: false 
          },
          resources: { 
            total: resourcesResponse.data?.totalResources || 0, 
            loading: false 
          },
          activity: { 
            total: activityResponse.data?.totalActivities || 0, 
            loading: false 
          },
          departments: {
            data: usersResponse.data?.departmentDistribution || generateMockDepartmentData(),
            loading: false
          },
          resourceTypes: {
            data: resourcesResponse.data?.typeDistribution || generateMockResourceTypeData(),
            loading: false
          },
          dailyActivity: {
            data: activityResponse.data?.dailyActivity || generateMockDailyActivityData(),
            loading: false
          }
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        
        // Fallback to mock data
        setAnalytics({
          users: { total: resources.length > 0 ? Math.floor(resources.length * 1.5) : 120, loading: false },
          resources: { total: resources.length, loading: false },
          activity: { total: resources.length > 0 ? resources.length * 3 : 378, loading: false },
          departments: { data: generateMockDepartmentData(), loading: false },
          resourceTypes: { data: generateMockResourceTypeData(), loading: false },
          dailyActivity: { data: generateMockDailyActivityData(), loading: false }
        });
        
        setTodayStats({
          uploads: Math.floor(Math.random() * 10) + 5,
          downloads: Math.floor(Math.random() * 30) + 15
        });
        
        setIsLoading(false);
      }
    };

    fetchAnalytics();
    
    // Poll for resource updates to simulate real-time
    const intervalId = setInterval(() => {
      if (window.sharedResources !== resources) {
        setResources([...window.sharedResources]);
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [resources]);

  // Fetch real resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await api.get('/api/resources');
        if (response.data && response.data.resources) {
          const fetchedResources = response.data.resources.map((res: any) => ({
            id: res._id,
            title: res.title,
            description: res.description,
            type: res.type,
            subject: res.subject,
            semester: res.semester,
            uploadDate: res.createdAt,
            fileName: res.fileName,
            fileUrl: res.fileUrl,
            stats: {
              views: res.stats?.views || 0,
              likes: res.stats?.likes || 0,
              comments: res.stats?.comments || 0,
              downloads: res.stats?.downloads || 0,
              lastViewed: res.stats?.lastViewed || new Date().toISOString()
            }
          }));
          
          setResources(fetchedResources);
          if (typeof window !== 'undefined') {
            window.sharedResources = fetchedResources;
          }
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };
    
    fetchResources();
  }, []);

  // Mock data generators (fallback if API fails)
  const generateMockDepartmentData = () => {
    return [
      { name: 'Computer Science', value: 450 },
      { name: 'Electronics', value: 320 },
      { name: 'Mechanical', value: 280 },
      { name: 'Civil', value: 190 },
      { name: 'Other', value: 150 }
    ];
  };

  const generateMockResourceTypeData = () => {
    return [
      { name: 'Document', value: 65 },
      { name: 'Video', value: 15 },
      { name: 'Link', value: 12 },
      { name: 'Note', value: 8 }
    ];
  };

  const generateMockDailyActivityData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        uploads: Math.floor(Math.random() * 20) + 5,
        downloads: Math.floor(Math.random() * 50) + 20,
        views: Math.floor(Math.random() * 100) + 50
      });
    }
    
    return data;
  };

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
    
    try {
      // Create a FormData object to send to the API
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('type', data.type);
      formData.append('subject', data.subject);
      formData.append('semester', data.semester.toString());
      
      if (data.file) {
        formData.append('file', data.file);
      }
      
      if (data.link) {
        formData.append('link', data.link);
      }
      
      // Send the API request
      const response = await api.post('/api/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const newResource: FacultyResource = {
        id: response.data.resource._id || Date.now().toString(),
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
      
      toast.success('Resource uploaded successfully!');
      setShowResourceUpload(false);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast.error('Failed to upload resource');
      
      // Fallback to client-side only if API fails
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
      
      window.sharedResources = [newResource, ...window.sharedResources];
      setResources([newResource, ...resources]);
      setShowResourceUpload(false);
      setCurrentView('dashboard');
    }
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

  // Colors for charts
  const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {currentView === 'dashboard' && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="flex items-center mb-6"
            variants={itemVariants}
          >
            <Shield className="mr-2 text-indigo-500" size={24} />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            variants={itemVariants}
          >
            <AnalyticsCard 
              title="Total Users" 
              value={analytics.users.loading ? '...' : analytics.users.total}
              change="12%" 
              trend="up" 
              icon={<Users className="h-6 w-6 text-indigo-500" />}
              isLoading={analytics.users.loading} 
            />
            <AnalyticsCard 
              title="Total Resources" 
              value={analytics.resources.loading ? '...' : analytics.resources.total}
              change="8%" 
              trend="up" 
              icon={<FileText className="h-6 w-6 text-green-500" />}
              isLoading={analytics.resources.loading} 
            />
            <AnalyticsCard 
              title="Uploads Today" 
              value={todayStats.uploads}
              change="15%" 
              trend="up" 
              icon={<Upload className="h-6 w-6 text-blue-500" />}
            />
            <AnalyticsCard 
              title="Downloads Today" 
              value={todayStats.downloads}
              change="5%" 
              trend="down" 
              icon={<Download className="h-6 w-6 text-yellow-500" />}
            />
          </motion.div>

          {/* Quick Action Buttons */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            variants={itemVariants}
          >
            <motion.button 
              onClick={handleStartUpload}
              className="flex items-center justify-center p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="mr-2" size={20} />
              Upload New Content
            </motion.button>
            <motion.button 
              className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => setCurrentView('resources')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileText className="mr-2" size={20} />
              Manage Resources
            </motion.button>
            <motion.button 
              className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => window.location.href = '/admin/users'}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="mr-2" size={20} />
              Manage Users
            </motion.button>
          </motion.div>

          {/* Analytics Charts */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            variants={itemVariants}
          >
            {/* Daily Activity Chart */}
            <motion.div 
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
              variants={itemVariants}
            >
              <div className="flex items-center mb-4">
                <Activity className="mr-2 text-indigo-500" size={20} />
                <h2 className="text-lg font-semibold dark:text-gray-200">Weekly Activity</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.dailyActivity.data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="uploads" fill="#4F46E5" />
                    <Bar dataKey="downloads" fill="#10B981" />
                    <Bar dataKey="views" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Department Distribution */}
            <motion.div 
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
              variants={itemVariants}
            >
              <div className="flex items-center mb-4">
                <PieChart className="mr-2 text-indigo-500" size={20} />
                <h2 className="text-lg font-semibold dark:text-gray-200">Resource Type Distribution</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={analytics.resourceTypes.data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.resourceTypes.data.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>

          {/* Subject Folders Section */}
          {window.subjectFolders && window.subjectFolders.length > 0 && (
            <motion.div 
              className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8"
              variants={itemVariants}
            >
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
                    <motion.div 
                      key={index} 
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                      whileHover={{ scale: 1.03, boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{folder.subjectName}</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <p>Lecturer: {folder.lecturerName}</p>
                        <p>Semester: {folder.semester}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
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
