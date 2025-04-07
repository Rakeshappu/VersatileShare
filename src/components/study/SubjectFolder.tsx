
import { useState } from 'react';
import { Folder, Book, ChevronDown, ChevronUp, Eye, Download, FileText, Video, Link as LinkIcon, File } from 'lucide-react';
import { FacultyResource } from '../../types/faculty';
import { ResourceItem } from './ResourceItem';
import { motion, AnimatePresence } from 'framer-motion';

interface SubjectFolderProps {
  subject: string;
  resources: FacultyResource[];
  sortBy: 'recent' | 'popular' | 'alphabetical';
}

export const SubjectFolder = ({ subject, resources, sortBy }: SubjectFolderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleFolder = () => {
    setIsOpen(!isOpen);
  };
  
  // Sort resources based on selected sort option
  const sortedResources = (() => {
    if (sortBy === 'recent') {
      return [...resources].sort((a, b) => 
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
    } else if (sortBy === 'popular') {
      return [...resources].sort((a, b) => b.stats.views - a.stats.views);
    } else {
      return [...resources].sort((a, b) => a.title.localeCompare(b.title));
    }
  })();
  
  // Calculate folder metrics
  const totalViews = resources.reduce((sum, resource) => sum + resource.stats.views, 0);
  const resourceCount = resources.length;
  

  // Get icon based on resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={toggleFolder}
      >
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Folder className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-800">{subject}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <span className="flex items-center">
                <Book className="h-4 w-4 mr-1" />
                <span>{resourceCount} {resourceCount === 1 ? 'item' : 'items'}</span>
              </span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{totalViews} {totalViews === 1 ? 'view' : 'views'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={`p-2 rounded-full ${isOpen ? 'bg-indigo-100' : 'bg-gray-100'} transition-colors`}>
          {isOpen ? 
            <ChevronUp className="h-5 w-5 text-indigo-600" /> : 
            <ChevronDown className="h-5 w-5 text-gray-600" />
          }
        </div>
      </div>
      
      {isOpen && (
        <div className="border-t border-gray-100">
          {sortedResources.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {sortedResources.map((resource) => (
                <ResourceItem key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No resources found for this subject
            </div>
          )}
        </div>
      )}
    </div>
  );
};
