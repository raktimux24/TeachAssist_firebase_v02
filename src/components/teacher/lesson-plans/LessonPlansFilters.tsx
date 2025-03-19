import { Search } from 'lucide-react';

interface LessonPlansFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  selectedClass: string;
  onClassChange: (classLevel: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const subjects = ['all', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];
const classes = ['all', 'Class 10', 'Class 11', 'Class 12'];
const statuses = ['all', 'draft', 'published'];
const sortOptions = [
  { value: 'date', label: 'Date Created' },
  { value: 'title', label: 'Title' },
  { value: 'subject', label: 'Subject' },
];

export default function LessonPlansFilters({
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  selectedClass,
  onClassChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
}: LessonPlansFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm ring-1 ring-gray-900/5">
      <div className="grid gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search lesson plans..."
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {/* Subject Filter */}
          <div>
            <label htmlFor="subject-filter" className="sr-only">Subject</label>
            <select
              id="subject-filter"
              value={selectedSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="block w-full pl-2 sm:pl-3 pr-6 sm:pr-8 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label htmlFor="class-filter" className="sr-only">Class</label>
            <select
              id="class-filter"
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              className="block w-full pl-2 sm:pl-3 pr-6 sm:pr-8 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {classes.map((classLevel) => (
                <option key={classLevel} value={classLevel}>
                  {classLevel === 'all' ? 'All Classes' : classLevel}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="sr-only">Status</label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="block w-full pl-2 sm:pl-3 pr-6 sm:pr-8 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort-filter" className="sr-only">Sort by</label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="block w-full pl-2 sm:pl-3 pr-6 sm:pr-8 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}