import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown, Menu, Sun, Moon } from 'lucide-react';
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

  const { logout } = useAuth();

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
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden -ml-1.5 sm:-ml-2 mr-2 p-1.5 sm:p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            {/* Page Title */}
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
              {location.pathname === '/teacher' ? 'Teacher Dashboard' :
               location.pathname === '/teacher/content' ? 'Content Generation' :
               location.pathname === '/teacher/lessons' ? 'Lesson Plans' :
               location.pathname === '/teacher/resources' ? 'My Resources' :
               location.pathname === '/teacher/settings' ? 'Settings' :
               'Teacher Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
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
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <span className="hidden sm:inline">John Smith</span>
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