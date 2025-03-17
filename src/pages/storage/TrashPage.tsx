
import React, { useState } from 'react';
import { Trash, FileText, RefreshCw } from 'lucide-react';

export const TrashPage = () => {
  const [trashedItems, setTrashedItems] = useState([
    { id: 1, name: 'Old Lecture Notes.pdf', type: 'PDF', size: '1.5 MB', date: '2023-10-10', deleteDate: '2023-11-10' },
    { id: 2, name: 'Draft Assignment.docx', type: 'Word', size: '0.9 MB', date: '2023-10-05', deleteDate: '2023-11-05' },
    { id: 3, name: 'Backup Files.zip', type: 'Archive', size: '7.2 MB', date: '2023-09-30', deleteDate: '2023-10-30' },
    { id: 4, name: 'Presentation Draft.pptx', type: 'PowerPoint', size: '4.3 MB', date: '2023-09-25', deleteDate: '2023-10-25' },
  ]);

  const restoreItem = (id: number) => {
    setTrashedItems(trashedItems.filter(item => item.id !== id));
    // In a real app, you would move this item back to its original location
  };

  const deleteItemPermanently = (id: number) => {
    setTrashedItems(trashedItems.filter(item => item.id !== id));
    // In a real app, this would permanently delete the item
  };

  const emptyTrash = () => {
    setTrashedItems([]);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <Trash className="mr-2 text-red-500" size={24} />
          Trash
        </h1>
        <button 
          onClick={emptyTrash}
          disabled={trashedItems.length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Empty Trash
        </button>
      </div>

      {trashedItems.length === 0 ? (
        <div className="text-center py-10">
          <Trash className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Trash is empty</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            There are no items in your trash.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {trashedItems.map((item) => (
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
                        <span>Deleted on {item.date}</span>
                      </p>
                      <p className="text-xs text-red-500">
                        Will be deleted permanently on {item.deleteDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => restoreItem(item.id)}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                      title="Restore"
                    >
                      <RefreshCw size={18} />
                    </button>
                    <button 
                      onClick={() => deleteItemPermanently(item.id)}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete permanently"
                    >
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
