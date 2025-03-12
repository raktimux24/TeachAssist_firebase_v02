import { Link } from 'react-router-dom';
import { Sun, Moon, GraduationCap } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Header({ isDarkMode, onThemeToggle }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
      <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
          <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="text-lg sm:text-xl font-semibold">TeachAssist Pro</span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link to="/" className="text-sm lg:text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
            <Link to="/#features" className="text-sm lg:text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</Link>
            <Link to="/#about" className="text-sm lg:text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</Link>
            <Link to="/#contact" className="text-sm lg:text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</Link>
            <Link to="/login" className="text-sm lg:text-base text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Login</Link>
          </div>
          
          <button
            onClick={onThemeToggle}
            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}