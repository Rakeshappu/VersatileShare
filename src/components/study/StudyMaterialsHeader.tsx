
import { BookOpen } from 'lucide-react';

interface StudyMaterialsHeaderProps {
  selectedSemester: number;
  onSemesterChange: (semester: number) => void;
  sortBy: 'recent' | 'popular' | 'alphabetical';
  onSortChange: (sortBy: string) => void;
}

export const StudyMaterialsHeader = ({ 
  selectedSemester, 
  onSemesterChange,
  sortBy,
  onSortChange 
}: StudyMaterialsHeaderProps) => {
  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
        <BookOpen className="h-6 w-6 text-indigo-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">Study Materials</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
            <button
              key={semester}
              onClick={() => onSemesterChange(semester)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedSemester === semester
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Semester {semester}
            </button>
          ))}
        </div>
        
        <select
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="recent">Recently Added</option>
          <option value="popular">Most Popular</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>
    </div>
  );
};
