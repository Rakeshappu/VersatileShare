
import { useState, useEffect } from 'react';
import { Upload, FileText } from 'lucide-react';
import { UploadFormData, SubjectFolder } from '../../types/faculty';
import { toast } from 'react-hot-toast';

interface ResourceUploadProps {
  onUpload: (data: UploadFormData) => Promise<void>;
  initialSubject?: string;
  initialSemester?: number;
  initialCategory?: string;
}

export const ResourceUpload = ({ 
  onUpload, 
  initialSubject, 
  initialSemester, 
  initialCategory
}: ResourceUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number>(initialSemester || 1);
  const [semesterSubjects, setSemesterSubjects] = useState<SubjectFolder[]>([]);
  const [isPlacementResource, setIsPlacementResource] = useState<boolean>(
    initialCategory === 'placement' || (initialSubject && initialSubject.includes('Placement'))
  );
  
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    type: 'document',
    subject: initialSubject || '',
    semester: initialSemester || 1,
    file: undefined,
    link: '',
  });

  // Initialize and get subject folders for the selected semester
  useEffect(() => {
    if (isPlacementResource) {
      // Don't need to fetch subjects for placement resources
      return;
    }
    
    // Get available subject folders from global state
    const allSubjectFolders = window.subjectFolders || [];
    
    // Filter for the selected semester
    const filteredSubjects = allSubjectFolders.filter(
      folder => folder.semester === selectedSemester
    );
    
    setSemesterSubjects(filteredSubjects);
    
    // Reset subject selection when semester changes
    if (formData.semester !== selectedSemester) {
      setFormData(prev => ({
        ...prev,
        semester: selectedSemester,
        subject: ''
      }));
    }
  }, [selectedSemester, formData.semester, isPlacementResource]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFormData({ ...formData, file });
    }
  };
  
  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSemester(Number(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      if (!isPlacementResource && !formData.subject.trim()) {
        throw new Error('Subject is required');
      }

      if (formData.type === 'link' && !formData.link) {
        throw new Error('URL is required for link resources');
      }

      if (formData.type !== 'link' && !formData.file) {
        throw new Error('File is required');
      }

      await onUpload({
        ...formData,
        semester: isPlacementResource ? 0 : selectedSemester
      });
      
      // Reset form after successful upload
      setFormData({
        title: '',
        description: '',
        type: 'document',
        subject: initialSubject || '',
        semester: isPlacementResource ? 0 : selectedSemester,
        file: undefined,
        link: '',
      });
      setFileName(null);
      
      // Show success message
      toast.success('Resource uploaded successfully!');
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload resource';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // For placement resources we use placement categories from the parent component
  const placementCategories = [
    { id: 'aptitude', name: 'Aptitude' },
    { id: 'dsa', name: 'Data Structures & Algorithms' },
    { id: 'oops', name: 'Object-Oriented Programming' },
    { id: 'os', name: 'Operating Systems' },
    { id: 'cn', name: 'Computer Networks' },
    { id: 'dbms', name: 'Database Management' },
    { id: 'interview', name: 'Interview Preparation' },
    { id: 'hr', name: 'HR Interview' },
    { id: 'resume', name: 'Resume Building' },
    { id: 'technical', name: 'Technical Skills' },
    { id: 'soft-skills', name: 'Soft Skills' },
    { id: 'general', name: 'General Resources' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {isPlacementResource ? 'Upload Placement Resource' : 'Upload Resource'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource Type*
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="note">Note</option>
              <option value="link">Link</option>
            </select>
          </div>
          
          {/* Show semester selection only for non-placement resources */}
          {!isPlacementResource && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester*
              </label>
              <select
                name="semester"
                value={selectedSemester}
                onChange={handleSemesterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* For placement resources, show placement categories instead of subjects */}
          {isPlacementResource ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                name="subject"
                value={formData.subject?.replace('Placement - ', '') || ''}
                onChange={(e) => {
                  const categoryName = e.target.value;
                  setFormData({
                    ...formData,
                    subject: `Placement - ${categoryName}`
                  });
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a category</option>
                {placementCategories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject*
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a subject</option>
                {semesterSubjects.length > 0 ? (
                  // Display subjects for the selected semester
                  semesterSubjects.map((folder, index) => (
                    <option key={index} value={folder.name}>
                      {folder.name} ({folder.lecturerName})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No subjects available for this semester</option>
                )}
              </select>
              
              {semesterSubjects.length === 0 && !isPlacementResource && (
                <p className="mt-1 text-sm text-gray-500">
                  No subjects available. Please create subject folders first.
                </p>
              )}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {formData.type === 'link' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL*
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required={formData.type === 'link'}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Upload*
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {fileName ? (
                  <div className="flex items-center justify-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="ml-2 text-sm text-gray-600">{fileName}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOCX, PPTX, MP4, etc. up to 50MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading || (!isPlacementResource && semesterSubjects.length === 0)}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isUploading || (!isPlacementResource && semesterSubjects.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </div>
      </form>
    </div>
  );
};
