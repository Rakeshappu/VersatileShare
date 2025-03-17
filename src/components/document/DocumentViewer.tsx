
import { useState, useEffect } from 'react';
import { FileText, File, X } from 'lucide-react';
import { getFileMimeType } from '../../utils/resourceUtils';

interface DocumentViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export const DocumentViewer = ({ fileUrl, fileName, onClose }: DocumentViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const mimeType = getFileMimeType(fileName);
  
  const isOfficeFile = (
    fileName.endsWith('.doc') || 
    fileName.endsWith('.docx') || 
    fileName.endsWith('.ppt') || 
    fileName.endsWith('.pptx') || 
    fileName.endsWith('.xls') || 
    fileName.endsWith('.xlsx')
  );
  
  const getGoogleViewerUrl = (url: string) => {
    // Use Google Docs Viewer for Office documents
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const img = new Image();
    img.onload = () => setLoading(false);
    img.onerror = () => {
      setError('Failed to load document preview');
      setLoading(false);
    };
    
    // Only attempt to preload if it's an image
    if (mimeType.startsWith('image/')) {
      img.src = fileUrl;
    } else {
      // For non-images, just set loading to false
      setLoading(false);
    }
  }, [fileUrl, mimeType]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{fileName}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500">
              <File className="h-16 w-16 mb-4" />
              <p>{error}</p>
            </div>
          ) : (
            <>
              {mimeType === 'application/pdf' ? (
                <iframe 
                  src={`${fileUrl}#view=FitH`} 
                  className="w-full h-full border-0"
                  title={fileName}
                ></iframe>
              ) : isOfficeFile ? (
                <iframe 
                  src={getGoogleViewerUrl(fileUrl)} 
                  className="w-full h-full border-0"
                  title={fileName}
                ></iframe>
              ) : mimeType.startsWith('image/') ? (
                <div className="flex items-center justify-center h-full">
                  <img 
                    src={fileUrl} 
                    alt={fileName} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : mimeType === 'text/plain' ? (
                <iframe 
                  src={fileUrl} 
                  className="w-full h-full border-0"
                  title={fileName}
                ></iframe>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <File className="h-16 w-16 mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Preview not available for this file type
                  </p>
                  <a 
                    href={fileUrl} 
                    download={fileName}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Download File
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
