import React from 'react';
import { FileText, Download, Pencil, Trash2, Eye } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadedAt: string;
  class?: string;
  subject?: string;
}

interface ResourcesListProps {
  isAdmin?: boolean;
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Mathematics Curriculum Guide',
    type: 'PDF',
    size: '2.5 MB',
    uploadedAt: '2 days ago',
    class: 'Class 10',
    subject: 'Mathematics',
  },
  {
    id: '2',
    title: 'Physics Lab Instructions',
    type: 'DOC',
    size: '1.8 MB',
    uploadedAt: '5 days ago',
    class: 'Class 11',
    subject: 'Physics',
  },
  {
    id: '3',
    title: 'Chemistry Notes',
    type: 'PDF',
    size: '3.2 MB',
    uploadedAt: '1 week ago',
    class: 'Class 12',
    subject: 'Chemistry',
  },
];

export default function ResourcesList({ isAdmin = false }: ResourcesListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        {isAdmin ? 'All Resources' : 'Your Resources'}
      </h2>

      <div className="space-y-4">
        {mockResources.map((resource) => (
          <div
            key={resource.id}
            className="flex flex-col sm:flex-row items-start sm:space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="flex-shrink-0 mb-3 sm:mb-0">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {resource.title}
              </p>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {resource.type} • {resource.size}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Uploaded {resource.uploadedAt}
                </p>
              </div>
              {(resource.class || resource.subject) && (
                <div className="mt-1 flex space-x-2">
                  {resource.class && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                      {resource.class}
                    </span>
                  )}
                  {resource.subject && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                      {resource.subject}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 flex space-x-2 mt-3 sm:mt-0">
              <button
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                title="View"
              >
                <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                title="Download"
              >
                <Download className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                title="Edit"
              >
                <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}