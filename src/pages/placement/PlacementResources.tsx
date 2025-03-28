
import { useState, useEffect } from 'react';
import { AIResourceSearch } from '../../components/search/AIResourceSearch';
import { useAuth } from '../../contexts/AuthContext';
import { ResourceUpload } from '../../components/faculty/ResourceUpload';
import { UploadFormData } from '../../types/faculty';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { API_ROUTES } from '../../lib/api/routes';
import { getResources, deleteResource } from '../../services/resource.service';
import { Briefcase, ChevronRight, Download, Link as LinkIcon, FileText, Loader, Trash2 } from 'lucide-react';

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
  { id: 'soft-skills', name: 'Soft Skills', description: 'Communication and interpersonal skills' },
  { id: 'general', name: 'General Resources', description: 'General placement preparation materials' },
];

const PlacementResources = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPlacementResources();
  }, []);

  const fetchPlacementResources = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching placement resources...');
      
      const fetchedResources = await getResources({ category: 'placement' });
      console.log('Placement resources response:', fetchedResources);
      
      if (Array.isArray(fetchedResources)) {
        setResources(fetchedResources);
      } else {
        setResources([]);
        console.error('Unexpected resource format:', fetchedResources);
      }
    } catch (error) {
      console.error('Error fetching placement resources:', error);
      toast.error('Failed to load placement resources');
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (data: UploadFormData) => {
    try {
      if (!selectedCategory) {
        toast.error('Please select a placement category first');
        return;
      }
      
      console.log('Uploading placement resource:', data);
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('type', data.type);
      formData.append('subject', `Placement - ${placementCategories.find(cat => cat.id === selectedCategory)?.name}`);
      formData.append('semester', '0'); // Placement resources are semester-agnostic
      formData.append('category', 'placement');
      formData.append('placementCategory', selectedCategory);
      
      if (data.file) {
        formData.append('file', data.file);
      }
      
      if (data.link) {
        formData.append('link', data.link);
      }
      
      console.log('Sending resource creation request');
      const response = await api.post(API_ROUTES.RESOURCES.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Resource creation response:', response.data);
      toast.success('Placement resource uploaded successfully!');
      
      setShowUploadForm(false);
      setSelectedCategory(null);
      
      // Fetch updated resources after successful upload
      fetchPlacementResources();
    } catch (error) {
      console.error('Error uploading placement resource:', error);
      toast.error('Failed to upload placement resource. Please try again.');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Deleting resource with ID:', resourceId);
      
      await deleteResource(resourceId);
      
      toast.success('Resource deleted successfully');
      
      // Update the local state to remove the deleted resource
      setResources(resources.filter(r => r._id !== resourceId));
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryResources = (categoryId: string) => {
    return resources.filter(resource => {
      if (resource.placementCategory) {
        return resource.placementCategory === categoryId;
      }
      
      const categoryName = placementCategories.find(cat => cat.id === categoryId)?.name || '';
      if (resource.subject && categoryName) {
        return resource.subject.toLowerCase().includes(categoryName.toLowerCase());
      }
      
      return false;
    });
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <div className="p-2 rounded-full bg-red-100 text-red-600"><FileText className="h-5 w-5" /></div>;
      case 'link':
        return <div className="p-2 rounded-full bg-blue-100 text-blue-600"><LinkIcon className="h-5 w-5" /></div>;
      default:
        return <div className="p-2 rounded-full bg-green-100 text-green-600"><FileText className="h-5 w-5" /></div>;
    }
  };

  useEffect(() => {
    console.log('Current resources state:', resources);
  }, [resources]);

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
        
        {showUploadForm && !selectedCategory && (
          <div className="mb-6">
            <button
              onClick={() => setShowUploadForm(false)}
              className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              ← Back to Resources
            </button>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Select a Placement Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {placementCategories.map(category => (
                  <div 
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors"
                  >
                    <h3 className="font-medium text-indigo-600">{category.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {showUploadForm && selectedCategory && (
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedCategory(null);
              }}
              className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              ← Back to Categories
            </button>
            <ResourceUpload 
              onUpload={handleUpload} 
              initialSubject={`Placement - ${placementCategories.find(cat => cat.id === selectedCategory)?.name}`}
              initialSemester={0} // Placement resources are semester-agnostic
              initialCategory="placement"
              isPlacementResource={true}
              placementCategory={selectedCategory} 
            />
          </div>
        )}
        
        {!showUploadForm && !selectedCategory && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {placementCategories.map((category) => {
                const categoryResources = getCategoryResources(category.id);
                return (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
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
              <h2 className="text-xl font-semibold">
                {placementCategories.find(cat => cat.id === selectedCategory)?.name} Resources
              </h2>
              {user && user.role === 'faculty' && (
                <button
                  onClick={() => {
                    setShowUploadForm(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                >
                  Add {placementCategories.find(cat => cat.id === selectedCategory)?.name} Resource
                </button>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading resources...</span>
              </div>
            ) : (
              <>
                {getCategoryResources(selectedCategory).length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {getCategoryResources(selectedCategory).map((resource) => (
                      <div
                        key={resource._id}
                        className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            {getResourceIcon(resource.type)}
                            <div className="ml-4">
                              <h3 className="font-medium text-indigo-700">{resource.title}</h3>
                              <p className="text-gray-600 text-sm mt-1">{resource.description}</p>
                              
                              <div className="flex mt-3 text-xs space-x-2">
                                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full capitalize">
                                  {resource.type}
                                </span>
                                {resource.fileUrl && (
                                  <a 
                                    href={resource.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center"
                                  >
                                    <Download className="h-3 w-3 mr-1" /> Download
                                  </a>
                                )}
                                {resource.link && (
                                  <a 
                                    href={resource.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center"
                                  >
                                    <LinkIcon className="h-3 w-3 mr-1" /> Open Link
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {user && user.role === 'faculty' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteResource(resource._id);
                              }}
                              className="text-red-500 hover:text-red-700 p-2"
                              title="Delete resource"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No resources available for {placementCategories.find(cat => cat.id === selectedCategory)?.name} yet.</p>
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
