import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../../firebase/config';

interface UserFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedOrganization: string;
  onOrganizationChange: (organization: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const statuses = ['all', 'active', 'inactive'];

export default function UserFilters({
  searchQuery,
  onSearchChange,
  selectedOrganization,
  onOrganizationChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
}: UserFiltersProps) {
  const [organizations, setOrganizations] = useState<string[]>(['all']);
  const [roles, setRoles] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(false);
  
  // Fetch unique organizations and roles from the database
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef);
        const querySnapshot = await getDocs(q);
        
        const uniqueOrgs = new Set<string>();
        const uniqueRoles = new Set<string>();
        
        // Add 'all' as the first option
        uniqueOrgs.add('all');
        uniqueRoles.add('all');
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.organization) uniqueOrgs.add(data.organization);
          if (data.role) uniqueRoles.add(data.role.toLowerCase());
        });
        
        setOrganizations(Array.from(uniqueOrgs));
        setRoles(Array.from(uniqueRoles));
      } catch (err) {
        console.error('Error fetching filter data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilters();
  }, []);
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm ring-1 ring-gray-900/5">
      <div className="grid gap-4 md:grid-cols-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search users..."
          />
        </div>

        {/* Organization Filter */}
        <div>
          <select
            value={selectedOrganization}
            onChange={(e) => onOrganizationChange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            disabled={loading}
          >
            {loading ? (
              <option>Loading organizations...</option>
            ) : (
              organizations.map((org) => (
                <option key={org} value={org}>
                  {org === 'all' ? 'All Organizations' : org}
                </option>
              ))
            )}
          </select>
          {loading && (
            <div className="absolute right-3 top-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            disabled={loading}
          >
            {loading ? (
              <option>Loading roles...</option>
            ) : (
              roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)} {role === 'all' && 'Roles'}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            disabled={loading}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)} {status === 'all' && 'Status'}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}