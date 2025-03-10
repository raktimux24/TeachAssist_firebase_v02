import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import AdminLayout from '../../../components/admin/AdminLayout';
import UploadForm from './components/UploadForm';
import MetadataForm from './components/MetadataForm';
import ResourcesList from './components/ResourcesList';

interface UploadResourcesProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  isAdmin?: boolean;
}

export default function UploadResources({ isDarkMode, onThemeToggle, isAdmin = false }: UploadResourcesProps) {
  const Layout = isAdmin ? AdminLayout : TeacherLayout;

  return (
    <Layout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload Resources
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isAdmin 
                ? 'Upload and manage resources available to all teachers'
                : 'Upload and manage your teaching resources'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Upload and Metadata Forms */}
            <div className="lg:col-span-2 space-y-6">
              <UploadForm />
              <MetadataForm />
            </div>

            {/* Resources List */}
            <div className="xl:col-span-1">
              <ResourcesList isAdmin={isAdmin} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}