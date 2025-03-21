
import { Briefcase, Code, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const quickAccessItems = [
  {
    title: 'Placement Preparation',
    icon: <Briefcase className="h-6 w-6" />,
    description: 'Interview prep, resume tips, and more',
    color: 'bg-purple-100 text-purple-600',
    path: '/placement-prep'
  },
  {
    title: 'Competitive Programming',
    icon: <Code className="h-6 w-6" />,
    description: 'Practice problems and solutions',
    color: 'bg-blue-100 text-blue-600',
    path: '/competitive-programming'
  },
  {
    title: 'Study Materials',
    icon: <BookOpen className="h-6 w-6" />,
    description: 'Notes, presentations, and guides',
    color: 'bg-green-100 text-green-600',
    path: '/study-materials'
  }
];

export const QuickAccess = () => {
  const navigate = useNavigate();
  
  const handleItemClick = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {quickAccessItems.map((item) => (
        <div
          key={item.title}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleItemClick(item.path)}
        >
          <div className={`${item.color} p-3 rounded-full w-fit mb-4`}>
            {item.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
      ))}
    </div>
  );
};
