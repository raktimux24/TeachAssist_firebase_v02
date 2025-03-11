import React, { useState } from 'react';
import { Resource } from '../../../types/resource';
import { FileIcon, Download, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { deleteResource } from '../../../firebase/resources';

interface ResourceGridProps {
  resources: Resource[];
  onResourceDeleted: () => void;
}

export default function ResourceGrid({ resources, onResourceDeleted }: ResourceGridProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (resource: Resource) => {
    if (!resource.id || !resource.fileUrl) return;
    
    try {
      setDownloadingId(resource.id);
      const response = await fetch(resource.fileUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (resource: Resource) => {
    if (!resource.id || !resource.fileUrl) return;
    
    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(resource.id);
      await deleteResource(resource.id, resource.fileUrl);
      toast.success('Resource deleted successfully');
      onResourceDeleted();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete resource');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
        >
          <div className="p-4 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="flex-shrink-0 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <FileIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white break-words">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {resource.fileName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleDownload(resource)}
                  disabled={downloadingId === resource.id || deletingId === resource.id}
                  title="Download resource"
                >
                  {downloadingId === resource.id ? (
                    <Loader2 className="h-4 w-4 text-gray-500 dark:text-gray-400 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                <button 
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleDelete(resource)}
                  disabled={downloadingId === resource.id || deletingId === resource.id}
                  title="Delete resource"
                >
                  {deletingId === resource.id ? (
                    <Loader2 className="h-4 w-4 text-gray-500 dark:text-gray-400 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Class</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {resource.class}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subject</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {resource.subject}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Chapter</span>
                <span className="font-medium text-gray-900 dark:text-white break-words text-right">
                  {resource.chapter}
                </span>
              </div>
              {resource.book && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Book</span>
                  <span className="font-medium text-gray-900 dark:text-white break-words text-right">
                    {resource.book}
                  </span>
                </div>
              )}
            </div>

            {resource.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="truncate mr-4">
                  By {resource.uploadedByName}
                </span>
                <span className="flex-shrink-0">
                  {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}