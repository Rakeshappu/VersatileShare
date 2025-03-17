
import { useState } from 'react';
import { FileText, Video, Link as LinkIcon, Eye, Download, Clock, ExternalLink } from 'lucide-react';
import { FacultyResource } from '../../types/faculty';
import { DocumentViewer } from '../document/DocumentViewer';

interface ResourceItemProps {
  resource: FacultyResource;
}

export const ResourceItem = ({ resource }: ResourceItemProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showDocViewer, setShowDocViewer] = useState(false);
  
  const getIcon = () => {
    switch (resource.type) {
      case 'document':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-600" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };
  
  const handleDownload = () => {
    if (resource.type === 'link' && resource.link) {
      // Open link in new tab
      window.open(resource.link, '_blank');
    } else if (resource.fileContent || resource.fileUrl) {
      // For documents, show the document viewer instead of downloading
      setShowDocViewer(true);
      
      // Update view/download count
      updateResourceStats();
    } else {
      console.error('No file content or URL available for this resource');
      alert('Sorry, this file cannot be opened. It may have been corrupted during upload.');
    }
  };
  
  const updateResourceStats = () => {
    // Update stats in memory
    if (window.sharedResources) {
      const resourceIndex = window.sharedResources.findIndex(r => r.id === resource.id);
      if (resourceIndex !== -1) {
        window.sharedResources[resourceIndex].stats.downloads += 1;
        window.sharedResources[resourceIndex].stats.lastViewed = new Date().toISOString();
        window.sharedResources[resourceIndex].stats.views += 1;
      }
    }
    
    // Update stats in MongoDB (in a real app this would be an API call)
    try {
      fetch('/api/resources/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: resource.id,
          action: 'view',
        }),
      });
    } catch (error) {
      console.error('Failed to update resource stats:', error);
    }
  };
  
  const handleView = () => {
    setShowPreview(!showPreview);
    
    // Update view count
    if (!showPreview) {
      if (window.sharedResources) {
        const resourceIndex = window.sharedResources.findIndex(r => r.id === resource.id);
        if (resourceIndex !== -1) {
          window.sharedResources[resourceIndex].stats.views += 1;
          window.sharedResources[resourceIndex].stats.lastViewed = new Date().toISOString();
        }
      }
    }
  };
  
  return (
    <div className="p-3 hover:bg-gray-50">
      <div className="flex items-start">
        <div className="p-2 bg-gray-100 rounded-md">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h4 className="font-medium text-gray-800 cursor-pointer hover:text-indigo-600" onClick={handleView}>
            {resource.title}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-1">{resource.description}</p>
          
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{new Date(resource.uploadDate).toLocaleDateString()}</span>
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span>{resource.stats.views} views</span>
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <Download className="h-3 w-3 mr-1" />
              <span>{resource.stats.downloads}</span>
            </div>
          </div>
        </div>
        <button 
          className="ml-2 p-2 text-indigo-600 hover:text-indigo-700"
          onClick={handleDownload}
          title={resource.type === 'link' ? 'Open Link' : 'View/Download'}
        >
          {resource.type === 'link' ? <ExternalLink className="h-5 w-5" /> : <Download className="h-5 w-5" />}
        </button>
      </div>
      
      {showPreview && (
        <div className="mt-3 p-3 border rounded-lg">
          {resource.type === 'document' && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {resource.fileName || 'Document'}
              </span>
              <button 
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                onClick={handleDownload}
              >
                Open Document
              </button>
            </div>
          )}
          {resource.type === 'link' && resource.link && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 truncate flex-1">{resource.link}</span>
              <button 
                className="ml-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium whitespace-nowrap"
                onClick={handleDownload}
              >
                Open Link
              </button>
            </div>
          )}
        </div>
      )}
      
      {showDocViewer && resource.fileUrl && (
        <DocumentViewer 
          fileUrl={resource.fileUrl} 
          fileName={resource.fileName || `${resource.title}.pdf`}
          onClose={() => setShowDocViewer(false)}
        />
      )}
    </div>
  );
};
