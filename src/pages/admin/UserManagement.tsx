import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import UserTable from '../../components/admin/users/UserTable';
import UserFilters from '../../components/admin/users/UserFilters';
import ActionPanel from '../../components/admin/users/ActionPanel';
import { RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { successToastOptions, getToastOptions } from '../../utils/toastConfig';

interface UserManagementProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function UserManagement({ isDarkMode, onThemeToggle }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const location = useLocation();
  
  // Handle refresh action
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Increment refresh key to trigger re-renders in child components
    setRefreshKey(prevKey => prevKey + 1);
    
    // Reset refreshing state after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('User data refreshed', successToastOptions);
    }, 1000);
  };
  
  // Check if we're coming from user creation or bulk upload
  useEffect(() => {
    const state = location.state as any;
    if (state?.newUserCreated) {
      // Show a toast notification for single user creation
      toast.success(`User with role ${state.userRole} was created successfully!`, successToastOptions);
      handleRefresh();
    } else if (state?.bulkUploadComplete) {
      // Show a toast notification for bulk upload completion
      const message = `Successfully created ${state.successCount} user${state.successCount > 1 ? 's' : ''}`;
      if (state.failedCount > 0) {
        toast.success(message + `. ${state.failedCount} failed.`, {
          ...successToastOptions,
          duration: 5000 // Show longer for bulk operations
        });
      } else {
        toast.success(message, successToastOptions);
      }
      handleRefresh();
    }
  }, [location.state]);

  return (
    <AdminLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <Toaster 
        position="top-center" 
        toastOptions={getToastOptions(isDarkMode)}
      />
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              User Management & Role Assignment
            </h1>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh user data"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <ActionPanel />
        </div>

        <UserFilters
          key={`filters-${refreshKey}`}
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
          key={`table-${refreshKey}`}
          searchQuery={searchQuery}
          selectedOrganization={selectedOrganization}
          selectedRole={selectedRole}
          selectedStatus={selectedStatus}
        />
      </div>
    </AdminLayout>
  );
}