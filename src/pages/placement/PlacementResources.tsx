
import { useState, useEffect } from 'react';
import { AIResourceSearch } from '../../components/search/AIResourceSearch';
import { useAuth } from '../../contexts/AuthContext';
import { ResourceUpload } from '../../components/faculty/ResourceUpload';
import { UploadFormData } from '../../types/faculty';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { API_ROUTES } from '../../lib/api/routes';
import { Briefcase, Folder, ChevronRight } from 'lucide-react';

// Placement categories
const placementCategories = [
  { id: 'aptitude', name: 'Aptitude', description: 'Quantitative, logical and verbal reasoning' },
  { id: 'dsa', name: 'Data Structures & Algorithms', description: 'Programming problems and solutions' },
  { id: 'oops', name: 'Object-Oriented Programming', description: 'OOP concepts and implementations' },
  { id: 'os', name: 'Operating Systems', description: 'OS concepts and interview questions' },
  { id: 'cn', name: 'Computer Networks', description: 'Networking principles and protocols' },
  { id: 'dbms', name: 'Database Management', description: 'SQL, DBMS concepts and normalization' },
  { id: 'interview', name: 'Interview Preparation', description: 'Mock interviews and tips' },
  { id: 'hr', name: 'HR Interview', description: 'HR questions and best practices' },
  { id: 'resume', name: 'Resume Building', description: 'Resume templates and tips' },
  { id: 'technical', name: 'Technical Skills', description: 'Language-specific and technical resources' },
];

const PlacementResources = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch placement resources when component mounts
  useEffect(() => {
    const fetchPlacementResources = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`${API_ROUTES.RESOURCES.LIST}?category=placement`);
        if (response.data && Array.isArray(response.data.resources)) {
          setResources(response.data.resources);
        } else if (response.data && Array.isArray(response.data)) {
          setResources(response.data);
        } else {
          setResources([]);
        }
      } catch (error) {
        console.error('Error fetching placement resources:', error);
        toast.error('Failed to load placement resources');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlacementResources();
  }, []);

  const handleUpload = async (data: UploadFormData) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('type', data.type);
      formData.append('subject', data.subject || `Placement - ${selectedCategory}`);
      formData.append('semester', '0'); // Placement resources are semester-agnostic
      formData.append('category', 'placement');
      
      if (data.file) {
        formData.append('file', data.file);
      }
      
      if (data.link) {
        formData.append('link', data.link);
      }
      
      await api.post(API_ROUTES.RESOURCES.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Placement resource uploaded successfully!');
      setShowUploadForm(false);
      
      // Refresh resources
      const response = await api.get(`${API_ROUTES.RESOURCES.LIST}?category=placement`);
      if (response.data && Array.isArray(response.data.resources)) {
        setResources(response.data.resources);
      } else if (response.data && Array.isArray(response.data)) {
        setResources(response.data);
      }
      
    } catch (error) {
      console.error('Error uploading placement resource:', error);
      toast.error('Failed to upload placement resource. Please try again.');
    }
  };

  const getCategoryResources = (categoryName: string) => {
    return resources.filter(resource => 
      resource.subject?.includes(categoryName) || 
      resource.subject?.includes(categoryName.toLowerCase()) ||
      resource.category === 'placement'
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Briefcase className="mr-2 h-6 w-6 text-indigo-600" />
        Placement Preparation Resources
      </h1>
      
      <div className="mb-8">
        <p className="text-gray-700 mb-6">
          Access comprehensive placement preparation resources organized by categories. These materials can help you prepare for technical interviews, improve your resume, and enhance your soft skills.
        </p>
        
        {user && user.role === 'faculty' && (
          <div className="mb-6">
            {!showUploadForm && !selectedCategory ? (
              <button
                onClick={() => setShowUploadForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Upload Placement Resource
              </button>
            ) : null}
          </div>
        )}
        
        {showUploadForm && (
          <div className="mb-6">
            <button
              onClick={() => {
                setShowUploadForm(false);
                setSelectedCategory(null);
              }}
              className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              ← Back to Resources
            </button>
            <ResourceUpload 
              onUpload={handleUpload} 
              initialSubject={selectedCategory ? `Placement - ${selectedCategory}` : "Placement Resources"}
              initialSemester={0} // Placement resources are semester-agnostic
              initialCategory="placement"
            />
          </div>
        )}
        
        {!showUploadForm && !selectedCategory && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {placementCategories.map((category) => {
                const categoryResources = getCategoryResources(category.name);
                return (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className="bg-white rounded-lg shadow-md p-5 cursor-pointer hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-indigo-700">{category.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      {categoryResources.length} {categoryResources.length === 1 ? 'resource' : 'resources'} available
                    </div>
                  </div>
                );
              })}
            </div>
            
            <AIResourceSearch initialSearchType="placement" />
          </>
        )}
        
        {!showUploadForm && selectedCategory && (
          <div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="mb-6 text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              ← Back to All Categories
            </button>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{selectedCategory} Resources</h2>
              {user && user.role === 'faculty' && (
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                >
                  Add {selectedCategory} Resource
                </button>
              )}
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {getCategoryResources(selectedCategory).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getCategoryResources(selectedCategory).map((resource) => (
                      <div
                        key={resource._id || resource.id}
                        className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start">
                          <Folder className="h-5 w-5 text-indigo-500 mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium text-indigo-700">{resource.title}</h3>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{resource.description}</p>
                            
                            <div className="flex mt-3 text-xs">
                              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full capitalize">
                                {resource.type}
                              </span>
                              {resource.fileUrl && (
                                <a 
                                  href={resource.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full"
                                >
                                  Download
                                </a>
                              )}
                              {resource.link && (
                                <a 
                                  href={resource.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                                >
                                  Visit Link
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No resources available for {selectedCategory} yet.</p>
                    {user && user.role === 'faculty' && (
                      <button
                        onClick={() => setShowUploadForm(true)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Add First Resource
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementResources;
