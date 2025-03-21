
import React from 'react';

export const TrashPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trash</h1>
      <p className="text-gray-600">This is the faculty trash page where you can recover deleted resources.</p>
      
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          Trash management feature is being developed. 
          You'll soon be able to recover deleted resources or permanently remove them.
        </p>
      </div>
    </div>
  );
};

export default TrashPage;
