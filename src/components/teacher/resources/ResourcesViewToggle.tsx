import React from 'react';
import { ViewIcon, GridIcon } from 'lucide-react';

interface ResourcesViewToggleProps {
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export default function ResourcesViewToggle({ viewMode, onViewModeChange }: ResourcesViewToggleProps) {
  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-1.5 sm:p-2 rounded-md ${
          viewMode === 'grid'
            ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Grid view"
      >
        <GridIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <button
        onClick={() => onViewModeChange('table')}
        className={`p-1.5 sm:p-2 rounded-md ${
          viewMode === 'table'
            ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Table view"
      >
        <ViewIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}