import { useState, useEffect } from 'react';
import { Resource } from '../../../types/resource';
import { FileIcon, Download, Trash2, Loader2, Tag, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { deleteResource, fetchResources } from '../../../firebase/resources';
import { getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase/config';
import { ref } from 'firebase/storage';
import { useAuth } from '../../../contexts/AuthContext';
import ResourceEditModal from './ResourceEditModal';

interface ResourceTableProps {
  resources?: Resource[];
  searchQuery?: string;
  selectedClass?: string;
  selectedSubject?: string;
  selectedBook?: string;
  selectedChapter?: string;
  showOnlyUserResources?: boolean;
  onResourceDeleted?: () => void;
}

export default function ResourceTable({ 
  resources: initialResources, 
  searchQuery = '', 
  selectedClass = 'all', 
  selectedSubject = 'all', 
  selectedBook = 'all',
  selectedChapter = 'all',
  showOnlyUserResources = false,
  onResourceDeleted 
}: ResourceTableProps) {
  const [resources, setResources] = useState<Resource[]>(initialResources || []);
  const [loading, setLoading] = useState(!initialResources);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    // If resources are provided directly, use those
    if (initialResources) {
      console.log('ResourceTable: Using provided resources:', initialResources.length);
      setResources(initialResources);
      return;
    }

    // Otherwise, fetch resources based on filters
    const loadResources = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Format class value for database query (remove "Class " prefix)
        const formattedClass = selectedClass === 'all' ? 'all' : selectedClass.replace('Class ', '');
        
        console.log('ResourceTable: Fetching resources with filters:', {
          searchQuery,
          class: selectedClass,
          formattedClass,
          subject: selectedSubject,
          book: selectedBook,
          chapter: selectedChapter,
          showOnlyUserResources
        });
        
        const fetchedResources = await fetchResources({
          searchQuery,
          class: formattedClass,
          subject: selectedSubject,
          book: selectedBook,
          chapter: selectedChapter
        });
        
        console.log('ResourceTable: Fetched resources count:', fetchedResources.length);
        console.log('ResourceTable: First few resources:', fetchedResources.slice(0, 3));
        
        // Log all resources with their uploadedBy field
        console.log('ResourceTable: All resources uploadedBy values:', 
          fetchedResources.map(r => ({ 
            id: r.id, 
            title: r.title, 
            uploadedBy: r.uploadedBy 
          }))
        );
        
        let filteredResources = fetchedResources;

        // Filter by user if showOnlyUserResources is true
        if (showOnlyUserResources && currentUser) {
          console.log('ResourceTable: Filtering by current user:', currentUser.uid);
          filteredResources = filteredResources.filter(
            (resource: Resource) => resource.uploadedBy === currentUser.uid
          );
          console.log('ResourceTable: After user filtering, resources count:', filteredResources.length);
        } else {
          console.log('ResourceTable: Not filtering by user, showing all resources');
        }

        console.log('ResourceTable: Final resources being displayed:', filteredResources);
        setResources(filteredResources);
      } catch (err) {
        console.error('Error loading resources:', err);
        setError('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [initialResources, searchQuery, selectedClass, selectedSubject, selectedBook, selectedChapter, showOnlyUserResources, currentUser]);

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
      onResourceDeleted?.();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete resource');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setEditModalOpen(true);
  };

  const handleResourceUpdated = () => {
    // Refresh resources after update
    if (initialResources) {
      // If resources are provided externally, trigger the parent's refresh mechanism
      onResourceDeleted?.();
    } else {
      // Otherwise, reload resources directly
      const loadResources = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const formattedClass = selectedClass === 'all' ? 'all' : selectedClass.replace('Class ', '');
          
          const fetchedResources = await fetchResources({
            searchQuery,
            class: formattedClass,
            subject: selectedSubject,
            book: selectedBook,
            chapter: selectedChapter
          });
          
          let filteredResources = fetchedResources;
          
          if (showOnlyUserResources && currentUser) {
            filteredResources = filteredResources.filter(
              (resource: Resource) => resource.uploadedBy === currentUser.uid
            );
          }
          
          setResources(filteredResources);
        } catch (err) {
          console.error('Error loading resources:', err);
          setError('Failed to load resources');
        } finally {
          setLoading(false);
        }
      };
      
      loadResources();
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      ) : !resources.length ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No resources found matching your filters.
          </p>
        </div>
      ) : (
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
                      {resource.tags && resource.tags.map((tag, index) => (
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
                        onClick={() => handleEdit(resource)}
                        disabled={downloadingId === resource.id || deletingId === resource.id}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit resource"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
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
      )}

      {/* Edit Modal */}
      <ResourceEditModal
        resource={selectedResource}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onResourceUpdated={handleResourceUpdated}
      />
    </>
  );
}