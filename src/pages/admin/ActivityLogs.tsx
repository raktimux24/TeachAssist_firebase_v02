import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ActivityLogFilters from '../../components/admin/activity-logs/ActivityLogFilters';
import ActivityLogTable from '../../components/admin/activity-logs/ActivityLogTable';

interface ActivityLogsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function ActivityLogs({ isDarkMode, onThemeToggle }: ActivityLogsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <AdminLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Activity Logs
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:mt-0">
            Track and monitor system activities
          </p>
        </div>

        <ActivityLogFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedUser={selectedUser}
          onUserChange={setSelectedUser}
          selectedActivity={selectedActivity}
          onActivityChange={setSelectedActivity}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <ActivityLogTable
          searchQuery={searchQuery}
          selectedUser={selectedUser}
          selectedActivity={selectedActivity}
          dateRange={dateRange}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </AdminLayout>
  );
}