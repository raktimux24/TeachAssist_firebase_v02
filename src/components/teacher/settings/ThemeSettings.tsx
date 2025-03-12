import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';

interface ThemeSettingsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function ThemeSettings({ isDarkMode, onThemeToggle }: ThemeSettingsProps) {
  const { userInfo } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleThemeToggle = async () => {
    // Toggle the theme first for immediate UI feedback
    onThemeToggle();
    
    // Save the theme preference to Firestore if user is authenticated
    if (userInfo?.uid) {
      try {
        setIsSaving(true);
        const userDocRef = doc(db, 'users', userInfo.uid);
        
        // Save the opposite of current isDarkMode since we already toggled it
        await updateDoc(userDocRef, {
          darkMode: !isDarkMode,
          updatedAt: serverTimestamp()
        });
        
        console.log('Theme preference saved to Firestore');
      } catch (error) {
        console.error('Error saving theme preference:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Theme Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-gray-400 mr-3" />
              ) : (
                <Sun className="h-5 w-5 text-gray-400 mr-3" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Dark Mode
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark themes
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isDarkMode}
              onClick={handleThemeToggle}
              disabled={isSaving}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500
                ${isDarkMode ? 'bg-primary-600' : 'bg-gray-200'}
                ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              <span
                aria-hidden="true"
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow
                  ring-0 transition duration-200 ease-in-out
                  ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}