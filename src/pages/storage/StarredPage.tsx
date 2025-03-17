
import React, { useState } from 'react';
import { Star, FileText, Download, Trash } from 'lucide-react';

export const StarredPage = () => {
  const [starredItems, setStarredItems] = useState([
    { id: 1, name: 'Introduction to React.pdf', type: 'PDF', size: '2.4 MB', date: '2023-10-15' },
    { id: 2, name: 'Database Systems Notes.docx', type: 'Word', size: '1.8 MB', date: '2023-10-10' },
    { id: 3, name: 'Algorithms Lecture.mp4', type: 'Video', size: '45.2 MB', date: '2023-09-28' },
    { id: 4, name: 'Data Structures Assignment.pdf', type: 'PDF', size: '3.1 MB', date: '2023-09-15' },
  ]);

  const removeFromStarred = (id: number) => {
    setStarredItems(starredItems.filter(item => item.id !== id));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <Star className="mr-2 text-yellow-500" size={24} />
          Starred Items
        </h1>
      </div>

      {starredItems.length === 0 ? (
        <div className="text-center py-10">
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No starred items</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You haven't starred any items yet.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {starredItems.map((item) => (
              <li key={item.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{item.name}</p>
                      <p className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{item.type}</span>
                        <span className="mx-1">•</span>
                        <span>{item.size}</span>
                        <span className="mx-1">•</span>
                        <span>{item.date}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                      <Download size={18} />
                    </button>
                    <button 
                      onClick={() => removeFromStarred(item.id)}
                      className="p-1 text-yellow-500 hover:text-yellow-600"
                    >
                      <Star size={18} fill="currentColor" />
                    </button>
                    <button className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
