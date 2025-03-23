
import { ChevronLeft } from 'lucide-react';

const placementCategories = [
  { id: 'aptitude', name: 'Aptitude', description: 'Quantitative, logical and verbal reasoning' },
  { id: 'dsa', name: 'Data Structures & Algorithms', description: 'Programming problems and solutions' },
  { id: 'oops', name: 'Object-Oriented Programming', description: 'OOP concepts and implementations' },
  { id: 'os', name: 'Operating Systems', description: 'OS concepts and interview questions' },
  { id: 'cn', name: 'Computer Networks', description: 'Networking principles and protocols' },
  { id: 'dbms', name: 'Database Management', description: 'SQL, DBMS concepts and normalization' },
  { id: 'interview', name: 'Interview Preparation', description: 'Mock interviews and tips' },
  { id: 'hr', name: 'HR Interview', description: 'HR questions and best practices' },
  { id: 'resume', name: 'Resume Building', description: 'Resume templates and tips' },
  { id: 'technical', name: 'Technical Skills', description: 'Language-specific and technical resources' },
  { id: 'soft-skills', name: 'Soft Skills', description: 'Communication and interpersonal skills' },
  { id: 'general', name: 'General Resources', description: 'Other placement-related materials' }
];

interface PlacementCategorySelectionProps {
  onCategorySelect: (categoryId: string, categoryName: string) => void;
  onBack: () => void;
}

export const PlacementCategorySelection = ({ onCategorySelect, onBack }: PlacementCategorySelectionProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Select Placement Category</h2>
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>

      <p className="text-gray-600 mb-4">
        Select a category for your placement resources. This helps students find relevant resources easily.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {placementCategories.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategorySelect(category.id, category.name)}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
          >
            <h3 className="font-medium text-indigo-600">{category.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
