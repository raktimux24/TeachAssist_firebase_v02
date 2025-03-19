import { Search, Filter } from 'lucide-react';

interface ClassNotesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  selectedClass: string;
  onClassChange: (classValue: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export default function ClassNotesFilters({
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  selectedClass,
  onClassChange,
  selectedType,
  onTypeChange,
  sortBy,
  onSortChange
}: ClassNotesFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
              placeholder="Search class notes..."
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Filter className="h-5 w-5" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          {/* Subject Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Subjects</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="history">History</option>
              <option value="geography">Geography</option>
              <option value="english">English</option>
              <option value="computer science">Computer Science</option>
            </select>
          </div>
          
          {/* Class Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Classes</option>
              <option value="grade 6">Grade 6</option>
              <option value="grade 7">Grade 7</option>
              <option value="grade 8">Grade 8</option>
              <option value="grade 9">Grade 9</option>
              <option value="grade 10">Grade 10</option>
              <option value="grade 11">Grade 11</option>
              <option value="grade 12">Grade 12</option>
            </select>
          </div>
          
          {/* Note Type Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="standard">Standard</option>
              <option value="detailed">Detailed</option>
              <option value="simplified">Simplified</option>
              <option value="visual">Visual</option>
              <option value="conceptual">Conceptual</option>
            </select>
          </div>
          
          {/* Sort By */}
          <div className="w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="date">Date (Newest)</option>
              <option value="title">Title (A-Z)</option>
              <option value="subject">Subject (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
