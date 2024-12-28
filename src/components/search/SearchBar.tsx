import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { SearchFilters } from '../../types';

export const SearchBar = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: [],
    category: []
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search resources, topics, or categories..."
          className="w-full px-4 py-3 pl-12 pr-10 text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        />
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        <button className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600">
          <Filter className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};