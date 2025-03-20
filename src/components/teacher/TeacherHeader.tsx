import { useState, useRef, useEffect } from 'react';
import { User as UserIcon, LogOut, Settings, ChevronDown, Menu, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface TeacherHeaderProps {
  onMenuClick: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function TeacherHeader({ onMenuClick, isDarkMode, onThemeToggle }: TeacherHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout, userInfo } = useAuth();
  
  // Function to get the page title based on the current path
  const getPageTitle = () => {
    const path = location.pathname;
    console.log('Current path:', path); // For debugging
    
    // Main sections
    if (path === '/teacher') return 'Teacher Dashboard';
    if (path === '/teacher/content') return 'Content Generation';
    if (path === '/teacher/lessons') return 'Lesson Plans';
    if (path === '/teacher/notes') return 'Class Notes';
    if (path === '/teacher/resources') return 'My Resources';
    if (path === '/teacher/settings') return 'Settings';
    if (path === '/teacher/presentations') return 'Presentations';
    if (path === '/teacher/question-sets') return 'Question Sets';
    if (path === '/teacher/flashcards') return 'Flashcards';
    
    // Flashcards
    if (path.includes('/teacher/content/flashcards/results')) return 'Flashcards Results';
    if (path.includes('/teacher/content/flashcards/view')) return 'View Flashcards';
    if (path.includes('/teacher/content/flashcards/edit')) return 'Edit Flashcards';
    if (path.includes('/teacher/content/flashcards')) return 'Flashcards Generator';
    
    // Question Sets
    if (path.includes('/teacher/content/question-sets/results')) return 'Question Set Results';
    if (path.includes('/teacher/content/question-sets')) return 'Question Set Generator';
    
    // Class Notes
    if (path.includes('/teacher/content/notes/results')) return 'Class Notes Results';
    if (path.includes('/teacher/content/notes/view')) return 'View Class Notes';
    if (path.includes('/teacher/content/notes')) return 'Class Notes Generator';
    
    // Lesson Plans
    if (path.includes('/teacher/content/lesson-plans/results')) return 'Lesson Plan Results';
    if (path.includes('/teacher/content/lesson-plans/view')) return 'View Lesson Plan';
    if (path.includes('/teacher/content/lesson-plans/edit')) return 'Edit Lesson Plan';
    if (path.includes('/teacher/content/lesson-plans')) return 'Lesson Plan Generator';
    
    // Presentations
    if (path.includes('/teacher/content/presentations/results')) return 'Presentation Results';
    if (path.includes('/teacher/content/presentations')) return 'Presentation Generator';
    
    // Default fallback
    return 'Teacher Panel';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-2 sm:px-6 lg:px-8">
        <div className="flex h-12 sm:h-14 md:h-16 items-center justify-between">
          <div className="flex items-center flex-shrink min-w-0 max-w-[70%] sm:max-w-[80%]">
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden -ml-1 sm:-ml-2 mr-1.5 sm:mr-2 p-1 sm:p-1.5 md:p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex-shrink-0"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
            {/* Page Title */}
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white truncate">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="p-1 sm:p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1.5 sm:space-x-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {userInfo?.photoURL ? (
                    <img 
                      src={userInfo.photoURL} 
                      alt={userInfo.fullName || 'User'} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                </div>
                <span className="hidden sm:inline">{userInfo?.fullName || 'Teacher'}</span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1 sm:mt-2 w-40 sm:w-48 rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <Link
                    to="/teacher/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <Settings className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <LogOut className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}