import { useState, useEffect } from 'react';
import { Resource } from '../../types/resource';
import AdminLayout from '../../components/admin/AdminLayout';
import ResourceGrid from '../../components/admin/resources/ResourceGrid';
import ResourceTable from '../../components/admin/resources/ResourceTable';
import ResourceFilters from '../../components/admin/resources/ResourceFilters';
import ResourceActionPanel from '../../components/admin/resources/ResourceActionPanel';
import { fetchResources } from '../../firebase/resources';
import { GridIcon, ViewIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResourceLibraryProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function ResourceLibrary({ isDarkMode, onThemeToggle }: ResourceLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const loadResources = async () => {
    try {
      setLoading(true);
      const fetchedResources = await fetchResources({
        searchQuery,
        class: selectedClass,
        subject: selectedSubject,
        chapter: selectedChapter
      });
      setResources(fetchedResources);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [searchQuery, selectedClass, selectedSubject, selectedChapter]);

  const handleResourceDeleted = () => {
    loadResources();
  };

  return (
    <AdminLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Resource Library
            </h1>
            <ResourceActionPanel />
          </div>

          <div className="flex items-center justify-between">
            <ResourceFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
              selectedChapter={selectedChapter}
              onChapterChange={setSelectedChapter}
            />
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <GridIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md ${
                  viewMode === 'table'
                    ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ViewIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading && viewMode === 'table' ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : viewMode === 'grid' ? (
            <ResourceGrid 
              searchQuery={searchQuery}
              selectedClass={selectedClass}
              selectedSubject={selectedSubject}
              selectedType={selectedChapter}
              onResourceDeleted={handleResourceDeleted} 
            />
          ) : (
            <ResourceTable resources={resources} onResourceDeleted={handleResourceDeleted} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}