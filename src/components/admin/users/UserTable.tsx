import React, { useState, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import { collection, getDocs, query, orderBy, Timestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { successToastOptions, errorToastOptions } from '../../../utils/toastConfig';
import EditUserModal from './EditUserModal';

interface User {
  id: string;
  fullName: string;
  organization: string;
  email: string;
  role: string;
  status?: 'active' | 'inactive';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastActive?: Timestamp;
}


interface UserTableProps {
  searchQuery: string;
  selectedOrganization: string;
  selectedRole: string;
  selectedStatus: string;
}

export default function UserTable({ searchQuery, selectedOrganization, selectedRole, selectedStatus }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOverflow, setActiveOverflow] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<User, 'id'>;
        usersData.push({
          id: doc.id,
          fullName: data.fullName || 'Unknown',
          organization: data.organization || 'Unknown',
          email: data.email || 'No email',
          role: data.role || 'student',
          status: data.status || 'active',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          lastActive: data.lastActive || data.updatedAt || data.createdAt
        });
      });
      
      setUsers(usersData);
      console.log('Fetched users:', usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
      toast.error('Failed to load users', errorToastOptions);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);
  

  const handleOverflowClick = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveOverflow(activeOverflow === userId ? null : userId);
  };

  // Close overflow menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeOverflow) {
        setActiveOverflow(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeOverflow]);
  
  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User deleted successfully', successToastOptions);
      } catch (err) {
        console.error('Error deleting user:', err);
        toast.error('Failed to delete user', errorToastOptions);
      }
    }
  };
  
  // Handle user status toggle
  const handleToggleStatus = async (userId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? {...user, status: newStatus} : user
      ));
      
      toast.success(`User status changed to ${newStatus}`, successToastOptions);
    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error('Failed to update user status', errorToastOptions);
    }
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp?: Timestamp) => {
    if (!timestamp) return 'Never';
    
    try {
      const date = timestamp.toDate();
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (err) {
      console.error('Error formatting timestamp:', err);
      return 'Unknown';
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
    setActiveOverflow(null);
  };

  const handleUserUpdated = () => {
    // Refresh the users list
    fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrganization = selectedOrganization === 'all' || user.organization === selectedOrganization;
    const matchesRole = selectedRole === 'all' || user.role.toLowerCase() === selectedRole.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesOrganization && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-8">
        <div className="text-red-500 dark:text-red-400 text-center">
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-8">
        <p className="text-gray-500 dark:text-gray-400 text-center">No users found. Add users to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No users match the current filters
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {user.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.organization}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                      }`}
                    >
                      {(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatTimestamp(user.lastActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        title="Edit user"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete user"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))
              }
            </tbody>
          </table>
        </div>
      </div>

      <EditUserModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleUserUpdated}
      />
    </>
  );
}