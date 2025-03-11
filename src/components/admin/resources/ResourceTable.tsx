import React, { useState } from 'react';
import { Resource } from '../../../types/resource';
import { FileIcon, Download, Trash2, Loader2, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { deleteResource } from '../../../firebase/resources';
import { getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase/config';
import { ref } from 'firebase/storage';

interface ResourceTableProps {
  resources: Resource[];
  onResourceDeleted: () => void;
}

export default function ResourceTable({ resources, onResourceDeleted }: ResourceTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (resource: Resource) => {
    if (!resource.id || !resource.fileUrl) return;
    
    try {
      setDownloadingId(resource.id);
      
      // Get the download URL using Firebase Storage SDK
      const downloadUrl = await getDownloadURL(ref(storage, resource.fileUrl));
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = resource.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Resource
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Details
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tags
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Uploaded
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {resources.map((resource) => (
            <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <FileIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {resource.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {resource.fileName}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  Class {resource.class} • {resource.subject}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {resource.chapter}
                  {resource.book && ` • ${resource.book}`}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {resource.uploadedByName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleDownload(resource)}
                    disabled={downloadingId === resource.id || deletingId === resource.id}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download resource"
                  >
                    {downloadingId === resource.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(resource)}
                    disabled={downloadingId === resource.id || deletingId === resource.id}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete resource"
                  >
                    {deletingId === resource.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}