import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface ResourcesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedClass: string;
  onClassChange: (classLevel: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const classes = ['all', 'Class 10', 'Class 11', 'Class 12'];
const subjects = ['all', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
const types = ['all', 'Document', 'Presentation', 'Worksheet', 'Video'];

export default function ResourcesFilters({
  searchQuery,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedSubject,
  onSubjectChange,
  selectedType,
  onTypeChange,
}: ResourcesFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm ring-1 ring-gray-900/5">
      <div className="space-y-3">
        {/* Search Input */}
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search resources..."
            />
          </div>
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex-shrink-0 inline-flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 md:hidden whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-1.5" />
            Filters
          </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${!isFiltersOpen ? 'hidden md:grid' : 'grid'}`}>
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
          >
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls === 'all' ? 'All Classes' : cls}
              </option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}