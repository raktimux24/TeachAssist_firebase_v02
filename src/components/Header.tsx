import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, GraduationCap, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Header({ isDarkMode, onThemeToggle }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-lg sm:text-xl font-bold">TeachAssist Pro</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link to="/" className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
              <Link to="/#features" className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</Link>
              <Link to="/#about" className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</Link>
              <Link to="/#contact" className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</Link>
              <Link to="/login" className="text-sm lg:text-base font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Login</Link>
            </div>
            
            <button
              onClick={onThemeToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-2 py-4">
                <Link 
                  to="/" 
                  className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/#features" 
                  className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  to="/#about" 
                  className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/#contact" 
                  className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  to="/login" 
                  className="text-base font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}