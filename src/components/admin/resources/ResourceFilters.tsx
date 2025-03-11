import React from 'react';
import { Search } from 'lucide-react';
import { AVAILABLE_CLASSES, AVAILABLE_SUBJECTS } from '../../../types/resource';

interface ResourceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedClass: string;
  onClassChange: (cls: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

export default function ResourceFilters({
  searchQuery,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedSubject,
  onSubjectChange,
}: ResourceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-1">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Search resources..."
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Class Filter */}
        <select
          value={selectedClass}
          onChange={(e) => onClassChange(e.target.value)}
          className="block w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="all">All Classes</option>
          {AVAILABLE_CLASSES.map((cls) => (
            <option key={cls} value={cls}>Class {cls}</option>
          ))}
        </select>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="block w-full sm:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="all">All Subjects</option>
          {AVAILABLE_SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>
    </div>
  );
}