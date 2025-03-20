import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { getUserFlashcardSets, deleteFlashcardSet } from '../../firebase/flashcards';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutGrid, List, Plus, Eye, Trash2 } from 'lucide-react';
import FlashcardFilters from '../../components/teacher/flashcards/FlashcardFilters';

interface FlashcardsListProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

interface FlashcardItem {
  id: string;
  title: string;
  subject: string;
  class: string;
  book: string;
  type: string;
  cardCount: number;
  createdAt: string;
  tags: string[];
  chapters: string[];
}

export default function FlashcardsList({ isDarkMode, onThemeToggle }: FlashcardsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedBook, setSelectedBook] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  // Fetch flashcards when component mounts or when user changes
  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!userInfo?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const sets = await getUserFlashcardSets(userInfo.uid);
        setFlashcards(sets);
      } catch (err) {
        console.error('Error fetching flashcards:', err);
        setError('Failed to load flashcards. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [userInfo?.uid]);

  // Filter and sort flashcards based on user selections
  const filteredAndSortedFlashcards = flashcards
    .filter(set => {
      // Filter by search query (title, subject, class)
      const matchesSearch = searchQuery === '' || 
        (set.title && set.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (set.subject && set.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (set.class && set.class.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (set.generationOptions?.chapters && set.generationOptions.chapters.some((chapter: string) => 
          chapter.toLowerCase().includes(searchQuery.toLowerCase())));
      
      // Filter by subject
      const matchesSubject = selectedSubject === 'all' || 
        (set.subject && set.subject.toLowerCase() === selectedSubject.toLowerCase());
      
      // Filter by class
      const matchesClass = selectedClass === 'all' || 
        (set.class && set.class.toLowerCase() === selectedClass.toLowerCase());
      
      // Filter by book
      const matchesBook = selectedBook === 'all' || 
        (set.book && set.book === selectedBook) ||
        (set.generationOptions?.book && set.generationOptions.book === selectedBook);
      
      // Filter by chapter
      const matchesChapter = selectedChapter === 'all' || 
        (set.generationOptions?.chapters && Array.isArray(set.generationOptions.chapters) && 
         set.generationOptions.chapters.includes(selectedChapter));
      
      // Filter by flashcard type
      const matchesType = selectedType === 'all' || 
        (set.type && set.type.toLowerCase() === selectedType.toLowerCase()) ||
        (set.generationOptions?.flashcardType && 
         set.generationOptions.flashcardType.toLowerCase() === selectedType.toLowerCase());
      
      return matchesSearch && matchesSubject && matchesClass && matchesBook && matchesChapter && matchesType;
    })
    .sort((a, b) => {
      // Sort by selected sort option
      if (sortBy === 'date') {
        // Handle cases where createdAt might be undefined or not a valid Date
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 
                     (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 
                     (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
        return dateB - dateA;
      } else if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'subject') {
        return (a.subject || '').localeCompare(b.subject || '');
      }
      return 0;
    });

  // Convert flashcards to the format expected by the components
  const formattedFlashcards: FlashcardItem[] = filteredAndSortedFlashcards.map(set => {
    // Extract book name from the set or generationOptions
    const bookName = set.book || set.generationOptions?.book || 'No Book';
    
    return {
      id: set.id || '',
      title: set.title || 'Untitled Flashcard Set',
      subject: set.subject || 'No Subject',
      class: set.class || 'No Class',
      book: bookName,
      type: set.type || set.generationOptions?.flashcardType || 'Standard',
      cardCount: set.cards?.length || 0,
      createdAt: set.createdAt instanceof Date 
        ? set.createdAt.toLocaleDateString() 
        : (set.createdAt?.toDate ? set.createdAt.toDate().toLocaleDateString() : 'Unknown Date'),
      tags: Array.isArray(set.generationOptions?.chapters) ? set.generationOptions.chapters : [],
      chapters: Array.isArray(set.generationOptions?.chapters) ? set.generationOptions.chapters : []
    };
  });

  // Handle view action
  const handleView = (id: string) => {
    navigate(`/teacher/content/flashcards/view/${id}`);
  };

  // Handle delete action
  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this flashcard set? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      try {
        deleteFlashcardSet(id).then(() => {
          // Refresh the flashcards list after deletion
          setFlashcards(flashcards.filter(f => f.id !== id));
        });
      } catch (error) {
        console.error('Error deleting flashcard set:', error);
        alert('Failed to delete the flashcard set. Please try again.');
      }
    }
  };

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-4 sm:space-y-6 w-full px-4 sm:px-6 md:px-0 max-w-[100vw] overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white truncate">
            Flashcards
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 p-1 rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${
                  viewMode === 'table' 
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' 
                    : 'text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400'
                }`}
                title="Table View"
                aria-label="Switch to table view"
              >
                <List className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid' 
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' 
                    : 'text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400'
                }`}
                title="Grid View"
                aria-label="Switch to grid view"
              >
                <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate('/teacher/content/flashcards')}
                className="inline-flex items-center px-2 sm:px-3 py-2 border border-transparent text-xs sm:text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Create New
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <FlashcardFilters
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
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Content Section */}
        <div className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px] w-full">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 sm:p-6 md:p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600 mb-3 sm:mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Loading flashcards...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 sm:p-6 md:p-8 text-center">
              <p className="text-red-500 dark:text-red-400">
                {error}
              </p>
            </div>
          ) : formattedFlashcards.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 sm:p-6 md:p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No flashcards found. Create your first flashcard set to get started.
              </p>
              <button
                onClick={() => navigate('/teacher/content/flashcards')}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="-ml-1 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create New Flashcard Set
              </button>
            </div>
          ) : (
            <div className="transition-all duration-300 w-full">
              {viewMode === 'table' ? (
                <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
                  {/* Mobile Card View */}
                  <div className="block md:hidden">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {formattedFlashcards.map((flashcard) => (
                        <div key={flashcard.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[70%]">{flashcard.title}</h3>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleView(flashcard.id)}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1"
                                title="View"
                              >
                                <Eye className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                                <span className="sr-only">View</span>
                              </button>
                              <button
                                onClick={() => handleDelete(flashcard.id)}
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
                            <div className="text-gray-900 dark:text-gray-300 font-medium">{flashcard.subject}</div>
                            
                            <div className="text-gray-500 dark:text-gray-400">Class:</div>
                            <div className="text-gray-900 dark:text-gray-300 font-medium">{flashcard.class}</div>
                            
                            <div className="text-gray-500 dark:text-gray-400">Book:</div>
                            <div className="text-gray-900 dark:text-gray-300 font-medium">{flashcard.book}</div>
                            
                            <div className="text-gray-500 dark:text-gray-400">Type:</div>
                            <div className="text-gray-900 dark:text-gray-300 font-medium">{flashcard.type}</div>
                            
                            <div className="text-gray-500 dark:text-gray-400">Cards:</div>
                            <div className="text-gray-900 dark:text-gray-300 font-medium">{flashcard.cardCount}</div>
                            
                            <div className="text-gray-500 dark:text-gray-400">Created:</div>
                            <div className="text-gray-900 dark:text-gray-300 font-medium">{flashcard.createdAt}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto -mx-4 sm:-mx-0">
                    <div className="w-full pb-2">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Subject
                      </th>
                      <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Class
                      </th>
                      <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Book
                      </th>
                      <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Cards
                      </th>
                      <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {formattedFlashcards.map((flashcard) => (
                      <tr key={flashcard.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{flashcard.title}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{flashcard.subject}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{flashcard.class}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{flashcard.book}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{flashcard.type}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{flashcard.cardCount}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{flashcard.createdAt}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleView(flashcard.id)}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                              title="View"
                            >
                              <Eye className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                              <span className="sr-only">View</span>
                            </button>
                            <button
                              onClick={() => handleDelete(flashcard.id)}
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
                <div className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {formattedFlashcards.map((flashcard) => (
                <div 
                  key={flashcard.id} 
                  className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate" title={flashcard.title}>
                      {flashcard.title}
                    </h3>
                    <div className="mt-2 flex flex-col space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Subject:</span> {flashcard.subject}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Class:</span> {flashcard.class}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Book:</span> {flashcard.book}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Type:</span> {flashcard.type}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Cards:</span> {flashcard.cardCount}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Created:</span> {flashcard.createdAt}
                      </p>
                    </div>
                    {flashcard.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {flashcard.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {flashcard.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            +{flashcard.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        onClick={() => handleView(flashcard.id)}
                        className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-transparent text-xs sm:text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform duration-200 hover:scale-105"
                        title="View"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(flashcard.id)}
                        className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm leading-4 font-medium rounded-md text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform duration-200 hover:scale-105"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
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
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
