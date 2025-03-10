import React, { useState } from 'react';
import { User, Palette } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import ThemeSettings from './ThemeSettings';

interface SettingsTabsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

type TabId = 'profile' | 'theme';

const tabs = [
  { id: 'profile', label: 'Profile Settings', icon: User },
  { id: 'theme', label: 'Theme Preferences', icon: Palette },
];

export default function SettingsTabs({ isDarkMode, onThemeToggle }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`
                  group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-sm font-medium text-center
                  hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-10 focus:outline-none
                  ${isActive
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-center justify-center">
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'theme' && (
          <ThemeSettings isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />
        )}
      </div>
    </div>
  );
}