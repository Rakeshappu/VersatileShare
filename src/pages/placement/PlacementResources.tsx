
import { useState } from 'react';
import { AIResourceSearch } from '../../components/search/AIResourceSearch';
import { useAuth } from '../../contexts/AuthContext';
import { ResourceUpload } from '../../components/faculty/ResourceUpload';
import { UploadFormData } from '../../types/faculty';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { API_ROUTES } from '../../lib/api/routes';

const PlacementResources = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { user } = useAuth();

  const handleUpload = async (data: UploadFormData) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('type', data.type);
      formData.append('subject', 'Placement Resources');
      formData.append('semester', data.semester.toString());
      formData.append('category', 'placement');
      
      if (data.file) {
        formData.append('file', data.file);
      }
      
      if (data.link) {
        formData.append('link', data.link);
      }
      
      const response = await api.post(API_ROUTES.RESOURCES.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Placement resource uploaded successfully!');
      setShowUploadForm(false);
    } catch (error) {
      console.error('Error uploading placement resource:', error);
      toast.error('Failed to upload placement resource. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Placement Preparation Resources</h1>
      
      <div className="mb-8">
        <p className="text-gray-700 mb-4">
          Search for placement preparation resources and interview questions using our AI-powered search tool.
          All results can be saved to your resources for later access.
        </p>
        
        {user && user.role === 'faculty' && (
          <div className="mb-6">
            {!showUploadForm ? (
              <button
                onClick={() => setShowUploadForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Upload Placement Resource
              </button>
            ) : (
              <div className="mb-6">
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  ← Back to Resources
                </button>
                <ResourceUpload 
                  onUpload={handleUpload} 
                  initialSubject="Placement Resources"
                  initialSemester={1}
                />
              </div>
            )}
          </div>
        )}
        
        <AIResourceSearch initialSearchType="placement" />
      </div>
    </div>
  );
};

export default PlacementResources;
