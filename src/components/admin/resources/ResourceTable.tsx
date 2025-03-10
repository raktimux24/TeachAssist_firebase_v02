import React from 'react';
import { FileText, FileImage, Film, FileSpreadsheet, File, MoreVertical, Download, Pencil, Trash2 } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: string;
  class?: string;
  subject: string;
  book?: string;
  chapter?: string;
  size: string;
  lastModified: string;
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

interface ResourceTableProps {
  searchQuery: string;
  selectedClass: string;
  selectedSubject: string;
  selectedBook: string;
  selectedChapter: string;
  showOnlyUserResources?: boolean;
}

export default function ResourceTable({ 
  searchQuery, 
  selectedClass, 
  selectedSubject,
  selectedBook,
  selectedChapter,
  showOnlyUserResources = false,
}: ResourceTableProps) {
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
    <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden relative">
      <div className="min-w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Subject
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Book
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Chapter
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Size
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Modified
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredResources.length > 0 ? filteredResources.map((resource) => {
              const Icon = getFileIcon(resource.type);
              
              return (
                <tr key={resource.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {resource.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {resource.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {resource.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {resource.book || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {resource.chapter || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {resource.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {resource.lastModified}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={() => console.log('Download resource:', resource.id)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={() => console.log('Edit resource:', resource.id)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        onClick={() => console.log('Delete resource:', resource.id)}
                        title="Delete"
                        title="More options"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No resources found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}