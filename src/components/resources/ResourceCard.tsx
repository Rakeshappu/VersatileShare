import React from 'react';
import { FileText, Video, Link as LinkIcon, Download } from 'lucide-react';
import { Resource } from '../../types';
import { formatDate } from '../../utils/dateUtils';

const iconMap = {
  pdf: FileText,
  video: Video,
  link: LinkIcon,
  document: FileText,
};

interface ResourceCardProps {
  resource: Resource;
  onDownload?: (resourceId: string) => void;
}

export const ResourceCard = ({ resource, onDownload }: ResourceCardProps) => {
  const Icon = iconMap[resource.type];

  const handleDownload = () => {
    if (onDownload) {
      onDownload(resource.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Icon className="h-6 w-6 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-gray-800">{resource.title}</h3>
            <p className="text-sm text-gray-600">{resource.description}</p>
          </div>
        </div>
        <button 
          onClick={handleDownload}
          className="text-indigo-600 hover:text-indigo-700"
        >
          <Download className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>Uploaded by {resource.uploadedBy}</span>
        <div className="flex items-center space-x-4">
          <span>{resource.views} views</span>
          <span>{resource.downloads} downloads</span>
          <span>{formatDate(resource.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};