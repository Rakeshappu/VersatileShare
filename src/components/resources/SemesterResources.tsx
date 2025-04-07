import { ResourceCard } from './ResourceCard';
import { useState, useEffect } from 'react';
import { FacultyResource } from '../../types/faculty';
import { getStandardizedCategory, getCategoryNameById } from '../../utils/placementCategoryUtils';

interface SemesterResourcesProps {
  semester: number;
  resources: FacultyResource[];
  loading?: boolean;
  showAllSemesters?: boolean;
  placementCategory?: string;
}

export const SemesterResources = ({ 
  semester, 
  resources, 
  loading = false,
  showAllSemesters = false,
  placementCategory
}: SemesterResourcesProps) => {
  const [filter, setFilter] = useState<string>('all');
  const [filteredResources, setFilteredResources] = useState<FacultyResource[]>([]);
  
  useEffect(() => {
    // Filter resources whenever props change
    let result = resources && Array.isArray(resources) ? [...resources] : [];
    
    // First, filter by semester or placement category
    result = result.filter(resource => {
      // For placement resources (semester 0 or category='placement')
      if (resource.category === 'placement' || semester === 0) {
        // If we're specifically looking at a placement category
        if (placementCategory) {
          const standardizedRequestedCategory = getStandardizedCategory(placementCategory);
          const resourceCategory = getStandardizedCategory(resource.placementCategory || '');
          
          // Direct matching between standardized categories
          return resourceCategory === standardizedRequestedCategory;
        }
        
        // If viewing all placement resources (semester 0)
        if (semester === 0) {
          return true;
        }
        
        // Students in all semesters should see placement resources
        return showAllSemesters;
      }
      
      // For regular resources, match the semester
      if (showAllSemesters) {
        return true;
      }
      
      return resource.semester === semester || 
        resource.semester === Number(semester);
    });
    
    // Then, apply type filter if selected
    if (filter !== 'all') {
      result = result.filter(resource => resource.type === filter);
    }
    
    setFilteredResources(result);
  }, [resources, semester, placementCategory, filter, showAllSemesters]);
  
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {showAllSemesters ? "All Semester Resources" : (
            semester === 0 ? (
              placementCategory ? 
                `${getCategoryNameById(placementCategory)} Resources` : 
                "Placement Resources"
            ) : `Semester ${semester} Resources`
          )}
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
              : semester === 0 
                ? placementCategory
                  ? `No ${getCategoryNameById(placementCategory)} resources available currently.`
                  : "No placement resources available currently."
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
