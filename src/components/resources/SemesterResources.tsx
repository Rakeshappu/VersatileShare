
import { ResourceCard } from './ResourceCard';
import { useState } from 'react';
import { FacultyResource } from '../../types/faculty';

interface SemesterResourcesProps {
  semester: number;
  resources: FacultyResource[];  // Updated to FacultyResource[] to match the expected type
  loading?: boolean;
  showAllSemesters?: boolean; // New prop to control if we show all resources or just this semester
}

export const SemesterResources = ({ 
  semester, 
  resources, 
  loading = false,
  showAllSemesters = false
}: SemesterResourcesProps) => {
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
  
  // Filter resources by semester unless showAllSemesters is true
  const semesterResources = resources && Array.isArray(resources) 
    ? (showAllSemesters 
        ? resources 
        : resources.filter(resource => 
            resource.semester === semester || 
            resource.semester === String(semester) ||
            // Also include resources with semester = 0 (common resources like placement)
            resource.semester === 0 || 
            resource.semester === '0'
          ))
    : [];
    
  // Apply type filter if selected
  const filteredResources = filter === 'all' 
    ? semesterResources 
    : semesterResources.filter(resource => resource.type === filter);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {showAllSemesters ? "All Semester Resources" : `Semester ${semester} Resources`}
        </h2>
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
          <p className="text-lg">
            {showAllSemesters 
              ? "No resources available currently."
              : "No resources available for this semester."}
          </p>
          <p className="text-sm mt-2">Check back later or ask your faculty to upload resources.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource._id || resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
};
