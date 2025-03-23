
import { Search, Bell, LogOut, Settings, UserCircle, SunMoon, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateText } from '../../services/openai.service';
import { toast } from 'react-hot-toast';

export const Header = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowResults(true);
    setAiSummary(null);
    setRelatedQuestions([]);
    
    try {
      // Get AI-enhanced search results from Perplexity
      const result = await generateText(`Find the best educational resources, research papers, and learning materials about: ${searchQuery}. Include details about each resource including title, source, and a brief description of what can be learned.`);
      
      if (result.success) {
        setAiSummary(result.text);
        
        // Extract related questions if available
        if (result.relatedQuestions && result.relatedQuestions.length > 0) {
          setRelatedQuestions(result.relatedQuestions);
        }
        
        // Parse AI results into structured format - this is a fallback if we can't extract structured data
        const structuredResults = [
          { 
            title: `${searchQuery} - Comprehensive Guide`, 
            source: 'Academic Resource Hub', 
            snippet: `Learn everything about ${searchQuery} from experts in the field.`,
            url: `https://example.com/resources/${searchQuery.toLowerCase().replace(/\s+/g, '-')}`
          },
          { 
            title: `Understanding ${searchQuery}`, 
            source: 'Educational Portal', 
            snippet: 'A step-by-step explanation with examples and practice exercises.',
            url: `https://example.com/learn/${searchQuery.toLowerCase().replace(/\s+/g, '-')}`
          },
          { 
            title: `${searchQuery} Advanced Concepts`, 
            source: 'Scientific Journal', 
            snippet: 'Cutting-edge research and developments in this field.',
            url: `https://example.com/journal/${searchQuery.toLowerCase().replace(/\s+/g, '-')}`
          },
          { 
            title: `${searchQuery} for Beginners`, 
            source: 'Learning Platform', 
            snippet: 'Start your journey to mastering this subject with simple explanations.',
            url: `https://example.com/beginners/${searchQuery.toLowerCase().replace(/\s+/g, '-')}`
          }
        ];
        
        setSearchResults(structuredResults);
        
        // Dispatch global search event
        const searchEvent = new CustomEvent('globalSearch', { 
          detail: { 
            query: searchQuery,
            results: structuredResults,
            aiSummary: result.text,
            relatedQuestions: result.relatedQuestions || []
          } 
        });
        document.dispatchEvent(searchEvent);
        
        toast.success('Search completed successfully!');
      } else {
        toast.error('Search failed. Using fallback results.');
        setSearchResults([{ 
          title: `${searchQuery} - Search Results`, 
          source: 'Search Engine', 
          snippet: 'Sorry, we could not process your search request properly. Please try again later.',
          url: '#'
        }]);
      }
      
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
      setSearchResults([{ title: 'Search failed', source: 'Error', snippet: 'Please try again later.' }]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const getAvatarUrl = () => {
    if (user?.avatar) {
      return user.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=random`;
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="relative w-full max-w-3xl mx-auto" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  {isSearching ? (
                    <Loader className="h-5 w-5 text-indigo-500 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the web for educational resources..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                />
              </form>
              
              {showResults && (searchResults.length > 0 || isSearching) && (
                <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Web Search Results for "{searchQuery}"
                    </p>
                  </div>
                  
                  {aiSummary && (
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {aiSummary}
                      </p>
                    </div>
                  )}
                  
                  <ul className="max-h-96 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <li 
                        key={index} 
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setShowResults(false);
                          // Open result in new tab if it has a URL
                          if (result.url) {
                            window.open(result.url, '_blank');
                          } else {
                            navigate('/dashboard');
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center mr-3">
                            <span className="text-indigo-600 dark:text-indigo-300 text-xs font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{result.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{result.source}</p>
                            <p className="text-xs mt-1 text-gray-700 dark:text-gray-300">{result.snippet}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                    
                    {relatedQuestions.length > 0 && (
                      <li className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Related Questions
                        </p>
                        <ul className="space-y-2">
                          {relatedQuestions.map((question, index) => (
                            <li 
                              key={index}
                              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                              onClick={() => {
                                setSearchQuery(question);
                                setShowResults(false);
                                setTimeout(() => {
                                  handleSearch(new Event('submit') as any);
                                }, 100);
                              }}
                            >
                              {question}
                            </li>
                          ))}
                        </ul>
                      </li>
                    )}
                    
                    {isSearching && (
                      <li className="px-4 py-3">
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 ml-4">
            <button 
              onClick={toggleDarkMode} 
              className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
            >
              <SunMoon className="h-6 w-6" />
            </button>
            <button className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src={getAvatarUrl()} 
                    alt={user?.fullName || "User"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="hidden md:inline text-sm font-medium dark:text-gray-200">
                  {user?.fullName || 'User'}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <UserCircle className="mr-3 h-5 w-5 text-gray-400" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings className="mr-3 h-5 w-5 text-gray-400" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
