import React from 'react';
import { FileText, FileImage, Film, FileSpreadsheet, File, MoreVertical, Download, Pencil, Trash2 } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: string;
  class?: string;
  subject?: string;
  book?: string;
  chapter?: string;
  size: string;
  lastModified: string;
  thumbnail?: string;
}

const resources: Resource[] = [
  {
    id: '1',
    name: 'Mathematics Curriculum Guide',
    type: 'document',
    subject: 'mathematics',
    size: '2.5 MB',
    lastModified: '2 days ago',
  },
  {
    id: '2',
    name: 'Physics Lab Instructions',
    type: 'pdf',
    subject: 'physics',
    size: '1.8 MB',
    lastModified: '5 days ago',
  },
  {
    id: '3',
    name: 'Chemistry Experiment Results',
    type: 'spreadsheet',
    subject: 'chemistry',
    size: '956 KB',
    lastModified: '1 week ago',
  },
  {
    id: '4',
    name: 'Literature Study Guide',
    type: 'document',
    subject: 'literature',
    size: '1.2 MB',
    lastModified: '3 days ago',
  },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'document':
      return FileText;
    case 'spreadsheet':
      return FileSpreadsheet;
    case 'video':
      return Film;
    case 'image':
      return FileImage;
    default:
      return File;
  }
};

interface ResourceGridProps {
  searchQuery: string;
  selectedClass: string;
  selectedSubject: string;
  selectedBook: string;
  selectedChapter: string;
  showOnlyUserResources?: boolean;
}

export default function ResourceGrid({ 
  searchQuery, 
  selectedClass, 
  selectedSubject,
  selectedBook,
  selectedChapter,
  showOnlyUserResources = false,
}: ResourceGridProps) {
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || resource.class === selectedClass;
    const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
    const matchesBook = selectedBook === 'all' || resource.book === selectedBook;
    const matchesChapter = selectedChapter === 'all' || resource.chapter === selectedChapter;
    const matchesUser = !showOnlyUserResources || resource.userId === 'current-user-id'; // Replace with actual user ID check
    return matchesSearch && matchesClass && matchesSubject && matchesBook && matchesChapter && matchesUser;
  });

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredResources.map((resource) => {
        const Icon = getFileIcon(resource.type);
        
        return (
          <div
            key={resource.id}
            className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-shadow"
          >
            <div className="p-4 relative">
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <div className="relative">
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 z-20"
                    onClick={() => console.log('More options clicked')}
                  >
                    <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  
                  {/* Action buttons that appear on hover */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block z-30">
                    <div className="py-1">
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => console.log('Download clicked')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => console.log('Edit clicked')}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => console.log('Delete clicked')}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {resource.name}
              </h3>
              
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>Size: {resource.size}</p>
                <p>Modified: {resource.lastModified}</p>
                <p className="capitalize">Type: {resource.type}</p>
                <p className="capitalize">Subject: {resource.subject}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}