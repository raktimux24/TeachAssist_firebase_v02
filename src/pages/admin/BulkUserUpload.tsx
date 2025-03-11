import React, { useState, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Download, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { successToastOptions, errorToastOptions } from '../../utils/toastConfig';

interface BulkUserUploadProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  organization?: string;
  roles?: string;
  status?: string;
  contactNumber?: string;
  errors?: string[];
}

const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_USERS = 1000;
const BATCH_SIZE = 10; // Process 10 users at a time

export default function BulkUserUpload({ isDarkMode, onThemeToggle }: BulkUserUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const downloadTemplate = () => {
    const template = [
      {
        'First Name': '',
        'Last Name': '',
        'Email Address': '',
        'Organization': '',
        'Role(s)': '',
        'Status': 'Active',
        'Contact Number': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'bulk_users_template.xlsx');
  };

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push('Invalid file type. Please upload an Excel (.xlsx) or CSV file.');
    }

    if (file.size > MAX_FILE_SIZE) {
      errors.push('File size exceeds 5MB limit.');
    }

    return errors;
  };

  const validateUser = (user: UserData): string[] => {
    const errors: string[] = [];

    if (!user.firstName?.trim()) errors.push('First Name is required');
    if (!user.lastName?.trim()) errors.push('Last Name is required');
    if (!user.email?.trim()) errors.push('Email is required');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (user.email && !emailRegex.test(user.email)) {
      errors.push('Invalid email format');
    }

    if (user.status && !['Active', 'Inactive'].includes(user.status)) {
      errors.push('Status must be either Active or Inactive');
    }

    return errors;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileErrors = validateFile(selectedFile);
    if (fileErrors.length > 0) {
      setValidationErrors(fileErrors);
      return;
    }

    setFile(selectedFile);
    setValidationErrors([]);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length > MAX_USERS) {
          setValidationErrors(['Maximum number of users (1000) exceeded']);
          return;
        }

        const processedUsers: UserData[] = jsonData.map((row: any) => ({
          firstName: row['First Name'] || '',
          lastName: row['Last Name'] || '',
          email: row['Email Address'] || '',
          organization: row['Organization'],
          roles: row['Role(s)'],
          status: row['Status'],
          contactNumber: row['Contact Number'],
        }));

        // Validate each user
        const usersWithErrors = processedUsers.map(user => ({
          ...user,
          errors: validateUser(user)
        }));

        setUsers(usersWithErrors);
      } catch (error) {
        setValidationErrors(['Error processing file. Please check the format.']);
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async () => {
    if (!users.length || validationErrors.length > 0) return;

    setIsProcessing(true);
    setUploadProgress(0);

    const validUsers = users.filter(user => !user.errors?.length);
    const totalUsers = validUsers.length;
    let successCount = 0;
    let failedUsers: { user: UserData; error: string }[] = [];

    // Process users in batches
    for (let i = 0; i < validUsers.length; i += BATCH_SIZE) {
      const batch = validUsers.slice(i, i + BATCH_SIZE);
      
      // Process each user in the current batch
      const batchPromises = batch.map(async (user) => {
        try {
          // Generate a temporary password (you might want to implement a more secure way)
          const tempPassword = Math.random().toString(36).slice(-8);
          
          // Prepare user data for signup
          const userData = {
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: (user.roles?.toLowerCase() || 'student') as 'admin' | 'teacher' | 'student',
            organization: user.organization || 'Default Organization'
          };

          // Create user account
          await signup(user.email, tempPassword, userData, false);
          successCount++;
          
          // TODO: Implement password reset email sending or store temporary passwords securely
          
        } catch (error) {
          failedUsers.push({
            user,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          });
        }
      });

      // Wait for all users in the current batch to be processed
      await Promise.all(batchPromises);

      // Update progress
      const progress = Math.min(((i + BATCH_SIZE) / totalUsers) * 100, 100);
      setUploadProgress(progress);
    }

    // Show completion message
    if (successCount > 0) {
      toast.success(
        `Successfully created ${successCount} user${successCount > 1 ? 's' : ''}${
          failedUsers.length > 0 ? `. ${failedUsers.length} failed.` : ''
        }`,
        successToastOptions
      );

      // If there were any failures, show them in a separate toast
      if (failedUsers.length > 0) {
        toast.error(
          `Failed to create ${failedUsers.length} user(s). Check console for details.`,
          errorToastOptions
        );
        console.error('Failed users:', failedUsers);
      }

      // Reset the form
      handleCancel();

      // Redirect back to user management with success state
      navigate('/admin/users', {
        replace: true,
        state: {
          bulkUploadComplete: true,
          successCount,
          failedCount: failedUsers.length,
          timestamp: new Date().getTime()
        }
      });
    } else {
      toast.error('Failed to create any users. Please try again.', errorToastOptions);
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setUsers([]);
    setValidationErrors([]);
    setIsProcessing(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validUsers = users.filter(user => !user.errors?.length);
  const invalidUsers = users.filter(user => user.errors?.length);

  return (
    <AdminLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Bulk User Upload
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Upload multiple users using an Excel or CSV file
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </button>
            </div>

            {/* File Upload */}
            <div className="mt-6">
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-600">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label className="relative cursor-pointer rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload a file</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="sr-only"
                        accept=".xlsx,.csv"
                        onChange={handleFileChange}
                        disabled={isProcessing}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Excel or CSV up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Validation Errors
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <ul className="list-disc pl-5 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {users.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Preview
                </h3>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {validUsers.length} Valid
                    </span>
                    {invalidUsers.length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {invalidUsers.length} Invalid
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Organization
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user, index) => (
                        <tr key={index} className={user.errors?.length ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.organization || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.status || 'Active'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isProcessing && (
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Uploading...
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {users.length > 0 && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isProcessing || invalidUsers.length > 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Users
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}