import { Search } from 'lucide-react';
import { AVAILABLE_CLASSES, AVAILABLE_SUBJECTS, AVAILABLE_CHAPTERS } from '../../../constants/resources';

interface ResourceFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  selectedChapter?: string;
  onChapterChange?: (value: string) => void;
}

export default function ResourceFilters({
  searchQuery,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedSubject,
  onSubjectChange,
  selectedChapter,
  onChapterChange,
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
          {AVAILABLE_CLASSES.map((cls: string) => (
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
          {AVAILABLE_SUBJECTS.map((subject: string) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>

        {/* Chapter Filter */}
        {onChapterChange && (
          <select
            value={selectedChapter || 'all'}
            onChange={(e) => onChapterChange(e.target.value)}
            className="block w-full sm:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="all">All Chapters</option>
            {AVAILABLE_CHAPTERS.map((chapter: string) => (
              <option key={chapter} value={chapter}>{chapter}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}