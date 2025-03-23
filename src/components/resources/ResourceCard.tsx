
import { FileText, Video, Link as LinkIcon, File, ExternalLink, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResourceCardProps {
  resource: any;
  onClick?: () => void;
}

// Object mapping resource types to their respective icons
const resourceTypeIcons = {
  document: FileText,
  video: Video,
  link: LinkIcon,
  note: File,
  pdf: FileText
};

export const ResourceCard = ({ resource, onClick }: ResourceCardProps) => {
  const ResourceIcon = resourceTypeIcons[resource.type as keyof typeof resourceTypeIcons] || File;
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } catch (e) {
      return 'N/A';
    }
  };
  
  // Format the date from createdAt, uploadDate, or timestamp
  const date = resource.createdAt || resource.uploadDate || resource.timestamp || new Date().toISOString();
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:border-indigo-200 hover:shadow-lg cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-start">
          <div className="bg-indigo-100 p-2 rounded-lg mr-4">
            <ResourceIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-1 line-clamp-2">
              {resource.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
              {resource.description}
            </p>
            <div className="flex items-center mt-3 text-xs text-gray-500">
              <span className="capitalize mr-3">{resource.type}</span>
              <span className="mr-3">•</span>
              <span>{formatDate(date)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 flex justify-between">
        <span className="text-xs text-gray-600">
          {resource.subject || 'Subject not specified'}
        </span>
        
        <div className="flex space-x-2">
          {resource.fileUrl && (
            <a 
              href={resource.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-indigo-600 hover:text-indigo-800"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
          
          {resource.type === 'link' && resource.link && (
            <a 
              href={resource.link} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-indigo-600 hover:text-indigo-800"
              title="Open link"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};
