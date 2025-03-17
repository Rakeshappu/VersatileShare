
import { useState, useEffect } from 'react';
import { BarChart2, Users, BookOpen, Download, Globe } from 'lucide-react';
import { SearchBar } from '../search/SearchBar';
import { UserBanner } from '../user/UserBanner';
import { AnalyticsCard } from '../analytics/AnalyticsCard';
import { SemesterResources } from '../resources/SemesterResources';
import { QuickAccess } from '../resources/QuickAccess';
import { ActivityFeed } from '../activities/ActivityFeed';
import { currentUser, recentActivities } from '../../data/mockData';
import { getResources, checkDatabaseConnection } from '../../services/resource.service';
import { Resource } from '../../types';

export const Dashboard = () => {
  const [webSearchResults, setWebSearchResults] = useState<any>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Check MongoDB connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkDatabaseConnection();
        setDbStatus(status);
        console.log('MongoDB connection status:', status);
      } catch (err) {
        console.error('Failed to check DB connection:', err);
      }
    };
    
    checkConnection();
  }, []);
  
  // Fetch resources from MongoDB
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        console.log('Fetching resources for semester:', currentUser.semester);
        const fetchedResources = await getResources({ semester: currentUser.semester });
        console.log('Fetched resources:', fetchedResources);
        setResources(fetchedResources || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError('Failed to load resources. Please try again later.');
        // Use empty array as fallback
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, []);
  
  // Listen for global search events
  useEffect(() => {
    const handleGlobalSearch = (event: any) => {
      setWebSearchResults(event.detail);
    };
    
    document.addEventListener('globalSearch', handleGlobalSearch);
    
    return () => {
      document.removeEventListener('globalSearch', handleGlobalSearch);
    };
  }, []);
  
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900">
      <SearchBar />
      
      <div className="mt-8">
        <UserBanner user={currentUser} />
      </div>

      {dbStatus && !dbStatus.connected && (
        <div className="my-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded">
          <p className="font-medium">MongoDB Connection Issue</p>
          <p className="text-sm">{dbStatus.message || 'Cannot connect to MongoDB'}</p>
        </div>
      )}

      {webSearchResults && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all duration-300 animate-fadeIn">
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Web Search Results: {webSearchResults.query}
            </h2>
          </div>
          
          <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">AI Summary</h3>
            <p className="text-gray-600 dark:text-gray-400">{webSearchResults.aiSummary}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {webSearchResults.results.map((result: any, index: number) => (
              <div key={index} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-400">{result.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{result.source}</p>
                <p className="mt-2 text-gray-700 dark:text-gray-300">{result.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <QuickAccess />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Resources"
          value={resources.length.toString()}
          change="12%"
          icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
        />
        <AnalyticsCard
          title="Total Views"
          value={(resources.reduce((total, resource) => total + (resource.views || 0), 0)).toString()}
          change="8%"
          icon={<BarChart2 className="h-6 w-6 text-indigo-600" />}
        />
        <AnalyticsCard
          title="Active Users"
          value="789"
          change="15%"
          icon={<Users className="h-6 w-6 text-indigo-600" />}
        />
        <AnalyticsCard
          title="Downloads"
          value={(resources.reduce((total, resource) => total + (resource.downloads || 0), 0)).toString()}
          change="5%"
          icon={<Download className="h-6 w-6 text-indigo-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <SemesterResources semester={currentUser.semester} resources={resources} />
          )}
        </div>
        <div>
          <ActivityFeed activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};
