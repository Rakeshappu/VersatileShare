
import { ResourceCard } from './ResourceCard';
import { Resource } from '../../types';
import { useState } from 'react';

interface SemesterResourcesProps {
  semester: number;
  resources: Resource[];
  loading?: boolean;
}

export const SemesterResources = ({ semester, resources, loading = false }: SemesterResourcesProps) => {
  const [filter, setFilter] = useState<string>('all');
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Semester {semester} Resources</h2>
          <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  const semesterResources = resources.filter(resource => resource.semester === semester);
  const filteredResources = filter === 'all' 
    ? semesterResources 
    : semesterResources.filter(resource => resource.type === filter);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Semester {semester} Resources</h2>
        <select
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="document">Documents</option>
          <option value="video">Videos</option>
          <option value="link">Links</option>
          <option value="note">Notes</option>
        </select>
      </div>
      
      {filteredResources.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No resources available for this semester.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
};
