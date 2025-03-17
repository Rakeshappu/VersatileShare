import { Search, Bell, User, LogOut, Settings, UserCircle, SunMoon, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateText } from '../../services/openai.service';

export const Header = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
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
    window.location.reload();
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const result = await generateText(`Find best educational resources and materials online about: ${searchQuery}`);
      
      const mockResults = [
        { title: `${searchQuery} - Comprehensive Guide`, source: 'Academic Resource Hub', snippet: `Learn everything about ${searchQuery} from experts in the field.` },
        { title: `Understanding ${searchQuery}`, source: 'Educational Portal', snippet: 'A step-by-step explanation with examples and practice exercises.' },
        { title: `${searchQuery} Advanced Concepts`, source: 'Scientific Journal', snippet: 'Cutting-edge research and developments in this field.' },
        { title: `${searchQuery} for Beginners`, source: 'Learning Platform', snippet: 'Start your journey to mastering this subject with simple explanations.' }
      ];
      
      setSearchResults(mockResults);
      
      const searchEvent = new CustomEvent('globalSearch', { 
        detail: { 
          query: searchQuery,
          results: mockResults,
          aiSummary: result.text
        } 
      });
      document.dispatchEvent(searchEvent);
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([{ title: 'Search failed', source: 'Error', snippet: 'Please try again later.' }]);
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="relative w-full max-w-xl" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  {isSearching ? (
                    <Loader className="h-5 w-5 text-gray-400 animate-spin" />
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
              
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Web Search Results
                    </p>
                  </div>
                  <ul className="max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <li 
                        key={index} 
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setShowResults(false);
                          navigate('/dashboard');
                        }}
                      >
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{result.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{result.source}</p>
                        <p className="text-xs mt-1 text-gray-700 dark:text-gray-300">{result.snippet}</p>
                      </li>
                    ))}
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
            <button className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100">
              <Bell className="h-6 w-6" />
            </button>
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
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
