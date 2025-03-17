
import { useState, useEffect } from 'react';
import { SearchBar } from '../../components/search/SearchBar';
import { SubjectFolder } from '../../components/study/SubjectFolder';
import { StudyMaterialsHeader } from '../../components/study/StudyMaterialsHeader';
import { groupBySemester, groupBySubject } from '../../utils/studyUtils';
import { FacultyResource } from '../../types/faculty';

export const StudyMaterialsPage = () => {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alphabetical'>('recent');
  const [resources, setResources] = useState<FacultyResource[]>([]);
  
  // Poll for updates to get the latest resources
  useEffect(() => {
    // Initialize shared resources if it doesn't exist
    if (!window.sharedResources) {
      window.sharedResources = [];
    }
    
    // Set initial resources
    setResources([...window.sharedResources]);
    
    // Set up polling to check for updates
    const intervalId = setInterval(() => {
      if (window.sharedResources) {
        setResources([...window.sharedResources]);
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Group resources by semester
  const resourcesBySemester = groupBySemester(resources);
  
  // Get resources for selected semester
  const semesterResources = resourcesBySemester[selectedSemester] || [];
  
  // Group by subject for the selected semester
  const subjectGroups = groupBySubject(semesterResources);
  
  // Sort subjects alphabetically
  const sortedSubjects = Object.keys(subjectGroups).sort();
  
  // Handle semester change
  const handleSemesterChange = (semester: number) => {
    setSelectedSemester(semester);
  };
  
  return (
    <div className="p-6 bg-gray-50">
      <SearchBar />
      
      <StudyMaterialsHeader 
        selectedSemester={selectedSemester} 
        onSemesterChange={handleSemesterChange}
        sortBy={sortBy}
        onSortChange={(sort) => setSortBy(sort as 'recent' | 'popular' | 'alphabetical')}
      />
      
      {sortedSubjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No resources available for Semester {selectedSemester}</p>
          <p className="mt-2">Check other semesters or wait for your faculty to upload resources.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {sortedSubjects.map((subject) => (
            <SubjectFolder 
              key={subject}
              subject={subject}
              resources={subjectGroups[subject]}
              sortBy={sortBy}
            />
          ))}
        </div>
      )}
    </div>
  );
};
