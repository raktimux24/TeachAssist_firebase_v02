import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ResourceGrid from '../../components/admin/resources/ResourceGrid';
import ResourceTable from '../../components/admin/resources/ResourceTable';
import ResourceFilters from '../../components/admin/resources/ResourceFilters';
import ResourceActionPanel from '../../components/admin/resources/ResourceActionPanel';
import { GridIcon, ViewIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ResourceLibraryProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function ResourceLibrary({ isDarkMode, onThemeToggle }: ResourceLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedBook, setSelectedBook] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { currentUser, userInfo } = useAuth();

  // Handler for class selection that resets subject, book, and chapter if class changes
  const handleClassChange = (classValue: string) => {
    setSelectedClass(classValue);
    if (classValue !== selectedClass) {
      setSelectedSubject('all');
      setSelectedBook('all');
      setSelectedChapter('all');
    }
  };

  // Handler for subject selection that resets book and chapter if subject changes
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    if (subject !== selectedSubject) {
      setSelectedBook('all');
      setSelectedChapter('all');
    }
  };

  // Handler for book selection that resets chapter if book changes
  const handleBookChange = (book: string) => {
    setSelectedBook(book);
    if (book !== selectedBook) {
      setSelectedChapter('all');
    }
  };

  // Log component render and user info
  useEffect(() => {
    console.log('ResourceLibrary: Component rendered');
    console.log('ResourceLibrary: Current user:', currentUser?.uid);
    console.log('ResourceLibrary: User info:', userInfo);
  }, [currentUser, userInfo]);

  const handleResourceDeleted = () => {
    console.log('ResourceLibrary: Resource deleted callback triggered');
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
              onClassChange={handleClassChange}
              selectedSubject={selectedSubject}
              onSubjectChange={handleSubjectChange}
              selectedBook={selectedBook}
              onBookChange={handleBookChange}
              selectedChapter={selectedChapter}
              onChapterChange={setSelectedChapter}
            />
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => {
                  console.log('ResourceLibrary: Switching to grid view');
                  setViewMode('grid');
                }}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <GridIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  console.log('ResourceLibrary: Switching to table view');
                  setViewMode('table');
                }}
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

          {/* Log rendering information */}
          <div className="hidden">
            {/* Using a hidden div to contain the console.log statement */}
            {(() => {
              console.log('ResourceLibrary: Rendering with viewMode:', viewMode, 'showOnlyUserResources: false');
              return null;
            })()}
          </div>
          
          {viewMode === 'grid' ? (
            <ResourceGrid 
              searchQuery={searchQuery}
              selectedClass={selectedClass}
              selectedSubject={selectedSubject}
              selectedBook={selectedBook}
              selectedType={selectedChapter}
              showOnlyUserResources={false}
              onResourceDeleted={handleResourceDeleted} 
            />
          ) : (
            <ResourceTable 
              searchQuery={searchQuery}
              selectedClass={selectedClass}
              selectedSubject={selectedSubject}
              selectedBook={selectedBook}
              selectedChapter={selectedChapter}
              showOnlyUserResources={false}
              onResourceDeleted={handleResourceDeleted}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}