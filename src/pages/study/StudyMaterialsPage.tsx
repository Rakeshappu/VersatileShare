
import { useState, useEffect } from 'react';
import { SearchBar } from '../../components/search/SearchBar';
import { SubjectFolder } from '../../components/study/SubjectFolder';
import { StudyMaterialsHeader } from '../../components/study/StudyMaterialsHeader';
import { groupBySemester, groupBySubject } from '../../utils/studyUtils';
import { FacultyResource } from '../../types/faculty';
import { motion } from 'framer-motion';

export const StudyMaterialsPage = () => {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alphabetical'>('recent');
  const [resources, setResources] = useState<FacultyResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Poll for updates to get the latest resources
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    // Initialize shared resources if it doesn't exist
    if (typeof window !== 'undefined') {
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
      
      return () => {
        clearInterval(intervalId);
        clearTimeout(timer);
      };
    }
    
    return () => clearTimeout(timer);
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="p-6 bg-gray-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <SearchBar />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <StudyMaterialsHeader 
          selectedSemester={selectedSemester} 
          onSemesterChange={handleSemesterChange}
          sortBy={sortBy}
          onSortChange={(sort) => setSortBy(sort as 'recent' | 'popular' | 'alphabetical')}
        />
      </motion.div>
      
      {sortedSubjects.length === 0 ? (
        <motion.div 
          className="text-center py-12 text-gray-500"
          variants={itemVariants}
        >
          <p className="text-lg">No resources available for Semester {selectedSemester}</p>
          <p className="mt-2">Check other semesters or wait for your faculty to upload resources.</p>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
          variants={containerVariants}
        >
          {sortedSubjects.map((subject) => (
            <motion.div key={subject} variants={itemVariants}>
              <SubjectFolder 
                subject={subject}
                resources={subjectGroups[subject]}
                sortBy={sortBy}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
