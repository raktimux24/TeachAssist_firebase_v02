import React from 'react';
import { Search, Calendar } from 'lucide-react';

interface ActivityLogFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedUser: string;
  onUserChange: (user: string) => void;
  selectedActivity: string;
  onActivityChange: (activity: string) => void;
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
}

const users = ['all', 'Admin', 'Teacher', 'Student'];
const activityTypes = [
  'all',
  'Login',
  'Logout',
  'Content Creation',
  'Resource Upload',
  'User Management',
  'Settings Change',
];

export default function ActivityLogFilters({
  searchQuery,
  onSearchChange,
  selectedUser,
  onUserChange,
  selectedActivity,
  onActivityChange,
  dateRange,
  onDateRangeChange,
}: ActivityLogFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm ring-1 ring-gray-900/5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search activities..."
          />
        </div>

        {/* User Filter */}
        <div>
          <select
            value={selectedUser}
            onChange={(e) => onUserChange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            {users.map((user) => (
              <option key={user} value={user}>
                {user === 'all' ? 'All Users' : user}
              </option>
            ))}
          </select>
        </div>

        {/* Activity Type Filter */}
        <div>
          <select
            value={selectedActivity}
            onChange={(e) => onActivityChange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            {activityTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Activities' : type}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}