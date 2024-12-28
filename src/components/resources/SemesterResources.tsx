import React, { useState } from 'react';
import { Resource } from '../../types';
import { ResourceCard } from './ResourceCard';
import {
  filterResourcesBySemester,
  sortResourcesByViews,
  sortResourcesByDate,
  sortResourcesByDownloads
} from '../../utils/resourceUtils';

interface SemesterResourcesProps {
  semester: number;
  resources: Resource[];
}

type SortOption = 'all' | 'recent' | 'popular' | 'downloads';

export const SemesterResources = ({ semester, resources }: SemesterResourcesProps) => {
  const [sortOption, setSortOption] = useState<SortOption>('all');

  const getSortedResources = () => {
    const semesterResources = filterResourcesBySemester(resources, semester);
    
    switch (sortOption) {
      case 'recent':
        return sortResourcesByDate(semesterResources);
      case 'popular':
        return sortResourcesByViews(semesterResources);
      case 'downloads':
        return sortResourcesByDownloads(semesterResources);
      default:
        return semesterResources;
    }
  };

  const handleDownload = (resourceId: string) => {
    console.log(`Downloading resource: ${resourceId}`);
    // Implement download logic here
  };

  const sortedResources = getSortedResources();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Current Semester Resources</h2>
        <select 
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
        >
          <option value="all">All Resources</option>
          <option value="recent">Recently Added</option>
          <option value="popular">Most Viewed</option>
          <option value="downloads">Most Downloaded</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedResources.map((resource) => (
          <ResourceCard 
            key={resource.id} 
            resource={resource}
            onDownload={handleDownload}
          />
        ))}
      </div>
    </div>
  );
};