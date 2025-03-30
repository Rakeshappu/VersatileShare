import { useState, useEffect } from 'react';
import { BarChart2, Users, ThumbsUp, MessageSquare, Calendar } from 'lucide-react';
import { AnalyticsCard } from '../../components/analytics/AnalyticsCard';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { getResourceAnalytics } from '../../services/resource.service';

interface AnalyticsData {
  views: number;
  uniqueViewers: number;
  likes: number;
  comments: number;
  likedBy: Array<{
    _id: string;
    fullName: string;
    avatar?: string;
    department?: string;
  }>;
  commentDetails: Array<{
    _id: string;
    content: string;
    createdAt: string;
    author: {
      _id: string;
      fullName: string;
      avatar?: string;
      department?: string;
    };
  }>;
  departmentDistribution: Array<{
    name: string;
    count: number;
  }>;
}

export const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Authentication token not found. Please login again.");
          setIsLoading(false);
          return;
        }
        
        console.log('Token available:', token.substring(0, 10) + '...');
        
        const response = await api.get('/api/resources/faculty');
        console.log('Faculty resources response:', response.data);
        
        if (response.data.resources && response.data.resources.length > 0) {
          setResources(response.data.resources || []);
          
          setSelectedResource(response.data.resources[0].id);
        } else {
          setIsLoading(false);
          setError("No resources found. Please upload resources first.");
        }
      } catch (error: any) {
        console.error('Error fetching resources:', error);
        setError(error.message || "Failed to load resources. Please try again later.");
        toast.error('Failed to load resources');
        setIsLoading(false);
      }
    };

    fetchResources().then(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedResource) {
      fetchResourceAnalytics(selectedResource);
    }
  }, [selectedResource]);

  const fetchResourceAnalytics = async (resourceId: string) => {
    if (!resourceId) {
      console.error('No resource ID provided');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching analytics for resource ID:', resourceId);
      const analyticsData = await getResourceAnalytics(resourceId);
      console.log('Analytics data:', analyticsData);
      
      setAnalyticsData(analyticsData);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError(error.message || "Failed to load analytics data for this resource.");
      toast.error('Failed to load analytics data');
      setIsLoading(false);
    }
  };

  const handleResourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const resourceId = e.target.value;
    setSelectedResource(resourceId);
  };

  const handleRetry = () => {
    setError(null);
    const currentResource = selectedResource;
    if (resources.length === 0) {
      setSelectedResource(null);
      const fetchResources = async () => {
        try {
          setIsLoading(true);
          const response = await api.get('/api/resources/faculty');
          if (response.data.resources && response.data.resources.length > 0) {
            setResources(response.data.resources);
            setSelectedResource(response.data.resources[0].id);
          } else {
            setIsLoading(false);
            setError("No resources found. Please upload resources first.");
          }
        } catch (error: any) {
          console.error('Error retrying resource fetch:', error);
          setError(error.message || "Failed to load resources. Please try again later.");
          setIsLoading(false);
        }
      };
      fetchResources();
    } else if (currentResource) {
      fetchResourceAnalytics(currentResource);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Resource Analytics</h1>
      
      <div className="mb-6">
        <label htmlFor="resource-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Resource
        </label>
        <select
          id="resource-select"
          className="border border-gray-300 rounded-md p-2 w-full max-w-md"
          value={selectedResource || ''}
          onChange={handleResourceChange}
          disabled={isLoading || resources.length === 0}
        >
          {resources.length === 0 && <option value="">No resources available</option>}
          {resources.map(resource => (
            <option key={resource.id} value={resource.id}>
              {resource.title}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex flex-col">
            <p className="text-red-700 mb-2">{error}</p>
            <button 
              onClick={handleRetry} 
              className="self-start px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : !analyticsData ? (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">No Analytics Available</h2>
          <p className="text-gray-600">
            Select a resource to view its analytics or upload new resources to track their engagement.
          </p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnalyticsCard
              title="Total Views"
              value={analyticsData.views || 0}
              icon={<BarChart2 className="h-6 w-6 text-indigo-600" />}
            />
            <AnalyticsCard
              title="Unique Students"
              value={analyticsData.uniqueViewers || 0}
              icon={<Users className="h-6 w-6 text-blue-600" />}
            />
            <AnalyticsCard
              title="Total Likes"
              value={analyticsData.likes || 0}
              icon={<ThumbsUp className="h-6 w-6 text-green-600" />}
            />
            <AnalyticsCard
              title="Comments"
              value={analyticsData.comments || 0}
              icon={<MessageSquare className="h-6 w-6 text-purple-600" />}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Who Liked This Resource</h2>
            {analyticsData.likedBy && analyticsData.likedBy.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.likedBy.map((user) => (
                  <div key={user._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.fullName} className="w-10 h-10 rounded-full" />
                      ) : (
                        <span className="text-indigo-600 font-medium">{user.fullName?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.department || 'No department'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No likes yet for this resource.</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            {analyticsData.commentDetails && analyticsData.commentDetails.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.commentDetails.map((comment) => (
                  <div key={comment._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                        {comment.author.avatar ? (
                          <img src={comment.author.avatar} alt={comment.author.fullName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-indigo-600 font-medium">{comment.author.fullName?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-indigo-700">{comment.author.fullName}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="mt-2 text-gray-700 p-3 bg-white rounded border border-gray-200">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No comments yet for this resource.</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Department Distribution</h2>
            {analyticsData.departmentDistribution && analyticsData.departmentDistribution.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.departmentDistribution.map((dept) => (
                  <div key={dept.name} className="flex items-center">
                    <span className="w-32 text-sm text-gray-600">{dept.name}</span>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-indigo-600 rounded-full"
                          style={{
                            width: `${(dept.count / analyticsData.views) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{dept.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No department data available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;