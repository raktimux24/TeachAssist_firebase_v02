import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import QuestionSetsFilters from '../../components/teacher/question-sets/QuestionSetsFilters';
import QuestionSetsTable from '../../components/teacher/question-sets/QuestionSetsTable';
import QuestionSetsGrid from '../../components/teacher/question-sets/QuestionSetsGrid';
import QuestionSetsActionPanel from '../../components/teacher/question-sets/QuestionSetsActionPanel';
import { getUserQuestionSets, deleteQuestionSet, QuestionSet } from '../../services/questionSetGeneration';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface QuestionSetsListProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function QuestionSetsList({ isDarkMode, onThemeToggle }: QuestionSetsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedBook, setSelectedBook] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  // Fetch question sets when component mounts or when user changes
  useEffect(() => {
    const fetchQuestionSets = async () => {
      if (!userInfo?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const sets = await getUserQuestionSets(userInfo.uid);
        setQuestionSets(sets);
      } catch (err) {
        console.error('Error fetching question sets:', err);
        setError('Failed to load question sets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionSets();
  }, [userInfo?.uid]);

  // Filter and sort question sets based on user selections
  const filteredAndSortedSets = questionSets
    .filter(set => {
      // Filter by search query (title, subject, class)
      const matchesSearch = searchQuery === '' || 
        (set.title && set.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (set.subject && set.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (set.class && set.class.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (set.chapters && set.chapters.some(chapter => chapter.toLowerCase().includes(searchQuery.toLowerCase())));
      
      // Filter by subject
      const matchesSubject = selectedSubject === 'all' || 
        (set.subject && set.subject.toLowerCase() === selectedSubject.toLowerCase());
      
      // Filter by class
      const matchesClass = selectedClass === 'all' || 
        (set.class && set.class.toLowerCase() === selectedClass.toLowerCase());
      
      // Filter by book
      const matchesBook = selectedBook === 'all' || 
        (set.book && set.book.toLowerCase() === selectedBook.toLowerCase());
      
      // Filter by chapter
      const matchesChapter = selectedChapter === 'all' || 
        (set.chapters && set.chapters.some(chapter => chapter.toLowerCase() === selectedChapter.toLowerCase()));
      
      return matchesSearch && matchesSubject && matchesClass && matchesBook && matchesChapter;
    })
    .sort((a, b) => {
      // Sort by date (default sort)
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return dateB - dateA;
    });

  // Convert question sets to the format expected by the components
  const formattedSets = filteredAndSortedSets.map(set => ({
    id: set.firebaseId || '',
    title: set.title || 'Untitled Question Set',
    subject: set.subject || 'No Subject',
    class: set.class || 'No Class',
    book: set.book || '',
    difficulty: set.difficulty || 'medium',
    questionCount: set.questions?.length || 0,
    createdAt: set.createdAt instanceof Date ? set.createdAt.toLocaleDateString() : 'Unknown Date',
    tags: Array.isArray(set.chapters) ? set.chapters : []
  }));

  // Handle edit, delete, and view actions
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question set? This action cannot be undone.')) {
      try {
        setLoading(true);
        console.log(`Attempting to delete question set with ID: ${id}`);
        
        const result = await deleteQuestionSet(id);
        
        console.log(`Delete operation result:`, result);
        toast.success(`Question set deleted successfully from collection '${result.collectionName}'`);
        
        // Remove the set from state
        setQuestionSets(prev => {
          const filtered = prev.filter(set => set.firebaseId !== id);
          console.log(`Removed question set from state. Previous count: ${prev.length}, New count: ${filtered.length}`);
          return filtered;
        });
      } catch (error) {
        console.error('Error deleting question set:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to delete question set: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (id: string) => {
    navigate(`/teacher/content/question-sets/results/${id}`);
  };

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-3 sm:space-y-6 w-full px-3 sm:px-6 md:px-0 max-w-[100vw] overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white truncate">
            Question Sets
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 p-0.5 sm:p-1 rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1 sm:p-1.5 rounded ${
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
                className={`p-1 sm:p-1.5 rounded ${
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
              <QuestionSetsActionPanel />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <QuestionSetsFilters
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
        />

        {/* Content Section */}
        <div className="min-h-[200px] sm:min-h-[300px] w-full">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-3 sm:p-6 md:p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600 mb-3 sm:mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Loading question sets...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-3 sm:p-6 md:p-8 text-center">
              <p className="text-red-500 dark:text-red-400">
                {error}
              </p>
            </div>
          ) : formattedSets.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-3 sm:p-6 md:p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No question sets found. Create your first question set to get started.
              </p>
              <button
                onClick={() => navigate('/teacher/content/question-sets')}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="-ml-1 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create New Question Set
              </button>
            </div>
          ) : (
            <div className="transition-all duration-300 w-full">
              {viewMode === 'table' ? (
                <div className="overflow-x-auto -mx-3 sm:-mx-0 rounded-lg">
                  <div className="w-full pb-2">
                    <QuestionSetsTable
                      sets={formattedSets}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full px-1 sm:px-0">
                  <QuestionSetsGrid
                    sets={formattedSets}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
