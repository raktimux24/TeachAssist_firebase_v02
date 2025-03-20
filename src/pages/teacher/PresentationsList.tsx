import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { getUserPresentations, FirebasePresentation, deletePresentation } from '../../services/presentationFirebaseService';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutGrid, List, Plus, Eye, Trash2 } from 'lucide-react';
import PresentationFilters from '../../components/teacher/presentation/PresentationFilters';

interface PresentationsListProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function PresentationsList({ isDarkMode, onThemeToggle }: PresentationsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedBook, setSelectedBook] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [presentations, setPresentations] = useState<FirebasePresentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  // Fetch presentations when component mounts or when user changes
  useEffect(() => {
    const fetchPresentations = async () => {
      if (!userInfo?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedPresentations = await getUserPresentations(userInfo.uid);
        setPresentations(fetchedPresentations);
      } catch (err) {
        console.error('Error fetching presentations:', err);
        setError('Failed to load presentations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPresentations();
  }, [userInfo?.uid]);

  // Filter and sort presentations based on user selections
  const filteredAndSortedPresentations = presentations
    .filter(presentation => {
      // Filter by search query (title, subject, class)
      const matchesSearch = searchQuery === '' || 
        (presentation.title && presentation.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (presentation.subject && presentation.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (presentation.class && presentation.class.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by subject
      const matchesSubject = selectedSubject === 'all' || 
        (presentation.subject && presentation.subject.toLowerCase() === selectedSubject.toLowerCase());
      
      // Filter by class
      const matchesClass = selectedClass === 'all' || 
        (presentation.class && presentation.class.toLowerCase() === selectedClass.toLowerCase());

      // Filter by book
      const matchesBook = selectedBook === 'all' || 
        (presentation.book && presentation.book === selectedBook);
      
      // Filter by chapter
      const matchesChapter = selectedChapter === 'all' || 
        (presentation.chapters && Array.isArray(presentation.chapters) && presentation.chapters.includes(selectedChapter));
      
      return matchesSearch && matchesSubject && matchesClass && matchesBook && matchesChapter;
    })
    .sort((a, b) => {
      // Sort by selected sort option
      if (sortBy === 'date') {
        // Handle cases where createdAt might be undefined or not a valid Date
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'subject') {
        return (a.subject || '').localeCompare(b.subject || '');
      }
      return 0;
    });

  // Convert presentations to the format expected by the components
  const formattedPresentations = filteredAndSortedPresentations.map(presentation => {
    // Extract book name from the first chapter if book is not available
    // This is for backward compatibility with presentations that don't have the book property
    let bookName = presentation.book || '';
    
    // If no book name is available and there are chapters, try to extract book name from the first chapter
    if (!bookName && Array.isArray(presentation.chapters) && presentation.chapters.length > 0) {
      // Chapters might be in format "Book Name - Chapter Name"
      const firstChapter = presentation.chapters[0];
      const dashIndex = firstChapter.indexOf(' - ');
      if (dashIndex > 0) {
        bookName = firstChapter.substring(0, dashIndex);
      }
    }

    return {
      id: presentation.firebaseId || '',
      title: presentation.title || 'Untitled Presentation',
      subject: presentation.subject || 'No Subject',
      class: presentation.class || 'No Class',
      book: bookName || 'No Book',
      type: presentation.type || 'standard',
      slideCount: presentation.slides?.length || 0,
      createdAt: presentation.createdAt instanceof Date ? presentation.createdAt.toLocaleDateString() : 'Unknown Date',
      chapters: Array.isArray(presentation.chapters) ? presentation.chapters : []
    };
  });

  // Handle delete action
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this presentation? This action cannot be undone.')) {
      try {
        await deletePresentation(id);
        setPresentations(presentations.filter(p => p.firebaseId !== id));
      } catch (err) {
        console.error('Error deleting presentation:', err);
        alert('Failed to delete presentation. Please try again later.');
      }
    }
  };

  // Handle view action
  const handleView = (id: string) => {
    navigate(`/teacher/content/presentations/${id}`);
  };



  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full px-2 sm:px-4 md:px-0 max-w-full overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white truncate">
            Presentations
          </h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-between sm:justify-end items-center">
            {/* View Toggle Button Group */}
            <div className="inline-flex rounded-md shadow-sm" role="group" aria-label="View mode toggle">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-l-lg border border-gray-200 dark:border-gray-600 focus:z-10 focus:ring-2 focus:ring-primary-500 ${
                  viewMode === 'table'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title="Table View"
              >
                <List className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-r-lg border border-l-0 border-gray-200 dark:border-gray-600 focus:z-10 focus:ring-2 focus:ring-primary-500 ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            
            {/* New Presentation Button */}
            <button
              onClick={() => navigate('/teacher/content/presentations')}
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="-ml-0.5 mr-1 sm:-ml-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              New
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <PresentationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          selectedBook={selectedBook}
          onBookChange={setSelectedBook}
          selectedChapter={selectedChapter}
          onChapterChange={setSelectedChapter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Content Section */}
        <div className="min-h-[300px] w-full">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 sm:p-6 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600 mb-3 sm:mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Loading presentations...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 sm:p-6 text-center">
              <p className="text-red-500 dark:text-red-400">
                {error}
              </p>
            </div>
          ) : formattedPresentations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 sm:p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No presentations found. Create your first presentation to get started.
              </p>
              <button
                onClick={() => navigate('/teacher/content/presentations')}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="-ml-1 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create New Presentation
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
              {/* Responsive Table with Card View on Mobile */}
              <div className="block md:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {formattedPresentations.map((presentation) => (
                    <div key={presentation.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[70%]">{presentation.title}</h3>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleView(presentation.id)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1"
                            title="View"
                          >
                            <Eye className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                            <span className="sr-only">View</span>
                          </button>
                          <button
                            onClick={() => handleDelete(presentation.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                        <div className="text-gray-500 dark:text-gray-400">Subject:</div>
                        <div className="text-gray-900 dark:text-gray-300 font-medium">{presentation.subject}</div>
                        
                        <div className="text-gray-500 dark:text-gray-400">Class:</div>
                        <div className="text-gray-900 dark:text-gray-300 font-medium">{presentation.class}</div>
                        
                        <div className="text-gray-500 dark:text-gray-400">Book:</div>
                        <div className="text-gray-900 dark:text-gray-300 font-medium">{presentation.book}</div>
                        
                        <div className="text-gray-500 dark:text-gray-400">Slides:</div>
                        <div className="text-gray-900 dark:text-gray-300 font-medium">{presentation.slideCount}</div>
                        
                        <div className="text-gray-500 dark:text-gray-400">Created:</div>
                        <div className="text-gray-900 dark:text-gray-300 font-medium">{presentation.createdAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto -mx-2 sm:-mx-0 rounded-lg">
                <div className="w-full min-w-0 pb-2">
                  <table className="w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Subject
                        </th>
                        <th scope="col" className="px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Class
                        </th>
                        <th scope="col" className="px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Book
                        </th>
                        <th scope="col" className="px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Slides
                        </th>
                        <th scope="col" className="px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="relative px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {formattedPresentations.map((presentation) => (
                        <tr key={presentation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{presentation.title}</div>
                          </td>
                          <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{presentation.subject}</div>
                          </td>
                          <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{presentation.class}</div>
                          </td>
                          <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{presentation.book}</div>
                          </td>
                          <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{presentation.slideCount}</div>
                          </td>
                          <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{presentation.createdAt}</div>
                          </td>
                          <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleView(presentation.id)}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                title="View"
                              >
                                <Eye className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                                <span className="sr-only">View</span>
                              </button>
                              <button
                                onClick={() => handleDelete(presentation.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <Trash2 className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                                <span className="sr-only">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full px-0 sm:px-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                {formattedPresentations.map((presentation) => (
                  <div 
                    key={presentation.id} 
                    className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-3 sm:p-4 md:p-5">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate mb-1">
                        {presentation.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {presentation.subject}
                        </span>
                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {presentation.class}
                        </span>
                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {presentation.slideCount} slides
                        </span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                        <span>Created: {presentation.createdAt}</span>
                      </div>
                      <div className="flex justify-between mt-3 sm:mt-4">
                        <button
                          onClick={() => handleView(presentation.id)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs sm:text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform duration-200 hover:scale-105"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(presentation.id)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm leading-4 font-medium rounded-md text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform duration-200 hover:scale-105"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
