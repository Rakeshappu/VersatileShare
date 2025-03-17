
import { useState } from 'react';
import { FileText, Video, Link as LinkIcon, BarChart2, Eye, ThumbsUp, MessageSquare, Trash2 } from 'lucide-react';
import { FacultyResource } from '../../types/faculty';
import { formatDate } from '../../utils/dateUtils';

interface ResourceListProps {
  resources: FacultyResource[];
  onViewAnalytics: (resourceId: string) => void;
  showDeleteButton?: boolean;
}

type FilterOption = 'all' | 'document' | 'video' | 'note' | 'link';
type SortOption = 'date' | 'views' | 'likes' | 'comments';

declare global {
  interface Window {
    sharedResources: FacultyResource[];
  }
}

export const ResourceList = ({ resources, onViewAnalytics, showDeleteButton = false }: ResourceListProps) => {
  const [filterType, setFilterType] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');

  const getIcon = (type: FacultyResource['type']) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const handleDeleteResource = (resourceId: string) => {
    // Update the shared resources to reflect deletion
    if (window.sharedResources) {
      window.sharedResources = window.sharedResources.filter(r => r.id !== resourceId);
    }
    
    // Show a toast or notification
    alert('Resource deleted successfully');
  };

  const filteredResources = resources
    .filter((resource) => filterType === 'all' || resource.type === filterType)
    .filter((resource) => selectedSemester === 'all' || resource.semester === selectedSemester)
    .sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.stats.views - a.stats.views;
        case 'likes':
          return b.stats.likes - a.stats.likes;
        case 'comments':
          return b.stats.comments - a.stats.comments;
        default:
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
    });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800">Your Resources</h2>
        
        <div className="flex flex-wrap gap-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterOption)}
          >
            <option value="all">All Types</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
            <option value="note">Notes</option>
            <option value="link">Links</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="date">Most Recent</option>
            <option value="views">Most Viewed</option>
            <option value="likes">Most Liked</option>
            <option value="comments">Most Comments</option>
          </select>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No resources found. Upload some resources to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    resource.type === 'video' ? 'bg-red-100 text-red-600' :
                    resource.type === 'link' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {getIcon(resource.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{resource.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Semester {resource.semester}</span>
                      <span>{resource.subject}</span>
                      <span>{formatDate(resource.uploadDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {showDeleteButton && (
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="text-sm">Delete</span>
                    </button>
                  )}
                  <button
                    onClick={() => onViewAnalytics(resource.id)}
                    className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
                  >
                    <BarChart2 className="h-5 w-5" />
                    <span className="text-sm">Analytics</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{resource.stats.views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{resource.stats.likes} likes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{resource.stats.comments} comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
