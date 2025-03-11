import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { successToastOptions, errorToastOptions, toasterProps } from '../../utils/toastConfig';

interface AddUserProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function AddUser({ isDarkMode, onThemeToggle }: AddUserProps) {
  const { signup, userInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ensure the current user is an admin
  useEffect(() => {
    // Check if user is logged in and is not an admin
    if (userInfo && userInfo.role !== 'admin') {
      console.log('Non-admin user detected, redirecting to appropriate dashboard');
      navigate('/dashboard', { replace: true });
    }
    
    // Check if we're returning from creating a user (via browser history state)
    const state = location.state as any;
    if (state?.newUserCreated) {
      console.log('Returned to AddUser after creating a user, redirecting back to user management');
      navigate('/admin/users', { replace: true });
    }
  }, [userInfo, navigate, location.state]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    organization: '',
    role: 'admin', // Set default role to admin since this is the admin panel
    status: 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate role selection
      if (!['admin', 'teacher', 'student'].includes(formData.role)) {
        throw new Error('Please select a valid role: admin, teacher, or student');
      }
      
      // Prepare user data for signup
      const userData = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: formData.role,
        organization: formData.organization
      };
      
      console.log('Creating user with role:', formData.role);
      
      // Create user in Firebase - pass false to indicate this is not the current user
      // This prevents the admin from being logged out when creating a new user
      await signup(formData.email, formData.password, userData, false);
      
      // Show success toast with brand-aligned styling and a slight delay before navigation
      const toastId = toast.success(`User created successfully with role: ${formData.role}!`, {
        ...successToastOptions,
        // This ensures the toast stays visible even during navigation
        id: 'user-created-success',
        duration: 5000, // Longer duration to ensure visibility
      });
      
      // Force toast to render immediately
      toast.dismiss();
      toast(toastId);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        organization: '',
        role: 'admin',
        status: 'active'
      });
      
      // Add a small delay to ensure the toast is visible before navigation
      console.log('Will redirect to /admin/users after brief delay for toast visibility');
      
      // Short delay to ensure toast is visible
      setTimeout(() => {
        // Use navigation with state to ensure proper routing
        navigate('/admin/users', { 
          replace: true, 
          state: { 
            forceAdmin: true,
            newUserCreated: true,
            userRole: formData.role,
            timestamp: new Date().getTime(),
            toastId: toastId // Pass the toast ID to potentially dismiss it if needed
          } 
        });
      }, 800); // Short delay for toast visibility
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create user', {
        ...errorToastOptions,
        duration: 5000, // Longer duration for error messages
        style: {
          ...successToastOptions.style,
          borderLeft: '4px solid #EF4444', // Red border for error
        },
        iconTheme: {
          primary: '#EF4444',
          secondary: 'white',
        },
      });
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <AdminLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      {/* Enhanced Toaster with brand-aligned styling */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#333333',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            fontWeight: '500',
            zIndex: 9999,
            borderLeft: '4px solid #0055FF', // primary-600 color
          },
        }}
        containerStyle={{
          top: 40,
          left: 20,
          right: 20,
          zIndex: 9999,
        }}
      />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Form Header */}
            <div className="px-6 py-5">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                User Information
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add a new user to the system
              </p>
            </div>

            {/* Form Fields */}
            <div className="px-6 py-5 space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white sm:text-sm"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white sm:text-sm"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white sm:text-sm"
                    required
                  />
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white sm:text-sm"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white sm:text-sm"
                    required
                  />
                </div>

                {/* Organization */}
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Organization
                  </label>
                  <input
                    type="text"
                    name="organization"
                    id="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white sm:text-sm"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white sm:text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <div className="mt-2 space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="inactive"
                        checked={formData.status === 'inactive'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}