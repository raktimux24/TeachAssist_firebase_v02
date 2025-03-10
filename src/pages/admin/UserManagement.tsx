import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import UserTable from '../../components/admin/users/UserTable';
import UserFilters from '../../components/admin/users/UserFilters';
import ActionPanel from '../../components/admin/users/ActionPanel';

interface UserManagementProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function UserManagement({ isDarkMode, onThemeToggle }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  return (
    <AdminLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            User Management & Role Assignment
          </h1>
          <ActionPanel />
        </div>

        <UserFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedOrganization={selectedOrganization}
          onOrganizationChange={setSelectedOrganization}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        <UserTable
          searchQuery={searchQuery}
          selectedOrganization={selectedOrganization}
          selectedRole={selectedRole}
          selectedStatus={selectedStatus}
        />
      </div>
    </AdminLayout>
  );
}