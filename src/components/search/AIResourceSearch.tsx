
import { useState } from 'react';
import { Search, BookOpen, Loader2, ExternalLink, Download } from 'lucide-react';
import serperService from '../../services/serper.service';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  source?: string;
}

interface AIResourceSearchProps {
  initialSearchType?: 'educational' | 'placement';
}

export const AIResourceSearch = ({ initialSearchType = 'educational' }: AIResourceSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchType, setSearchType] = useState<'educational' | 'placement'>(initialSearchType);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    
    setIsLoading(true);
    setResults([]);
    
    try {
      let searchResults;
      
      if (searchType === 'educational') {
        searchResults = await serperService.getEducationalResources(query);
      } else {
        searchResults = await serperService.getPlacementResources(query);
      }
      
      if (searchResults?.organic) {
        setResults(searchResults.organic);
      } else {
        toast.error('No results found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveResource = async (result: SearchResult) => {
    if (!user) {
      toast.error('Please log in to save resources');
      return;
    }
    
    try {
      const response = await api.post('/api/resources', {
        title: result.title,
        description: result.snippet || 'No description available',
        type: 'link',
        subject: searchType === 'educational' ? 'Study Materials' : 'Placement Preparation',
        semester: 1,
        link: result.link,
        category: searchType === 'educational' ? 'study' : 'placement'
      });
      
      if (response.data.success) {
        toast.success('Resource saved successfully');
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Search for Resources with AI</h2>
      
      <div className="mb-4">
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded-md ${
              searchType === 'educational' 
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
            onClick={() => setSearchType('educational')}
          >
            <BookOpen className="inline-block h-4 w-4 mr-2" />
            Educational Resources
          </button>
          
          <button
            className={`px-4 py-2 rounded-md ${
              searchType === 'placement' 
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
            onClick={() => setSearchType('placement')}
          >
            <BookOpen className="inline-block h-4 w-4 mr-2" />
            Placement Preparation
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search for ${searchType === 'educational' ? 'study materials' : 'placement resources'}...`}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </form>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-4 text-gray-600">Searching for the best resources...</p>
          </div>
        </div>
      )}
      
      {!isLoading && results.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">{results.length} results found</h3>
          
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium text-indigo-700">
                    {result.title}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => saveResource(result)}
                      className="text-green-600 hover:text-green-800"
                      title="Save to your resources"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">{result.snippet}</p>
                
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span className="truncate">
                    {result.link.length > 60 ? `${result.link.substring(0, 60)}...` : result.link}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isLoading && query && results.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No results found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search terms or search for a different topic.
          </p>
        </div>
      )}
    </div>
  );
};
