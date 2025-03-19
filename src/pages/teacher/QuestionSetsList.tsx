import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import QuestionSetsFilters from '../../components/teacher/question-sets/QuestionSetsFilters';
import QuestionSetsTable from '../../components/teacher/question-sets/QuestionSetsTable';
import QuestionSetsGrid from '../../components/teacher/question-sets/QuestionSetsGrid';
import QuestionSetsActionPanel from '../../components/teacher/question-sets/QuestionSetsActionPanel';
import { getUserQuestionSets, QuestionSet } from '../../services/questionSetGeneration';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutGrid, List, Plus } from 'lucide-react';

interface QuestionSetsListProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function QuestionSetsList({ isDarkMode, onThemeToggle }: QuestionSetsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('date');
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
      
      // Filter by difficulty
      const matchesDifficulty = selectedDifficulty === 'all' || 
        (set.difficulty && set.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
      
      return matchesSearch && matchesSubject && matchesClass && matchesDifficulty;
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

  // Convert question sets to the format expected by the components
  const formattedSets = filteredAndSortedSets.map(set => ({
    id: set.firebaseId || '',
    title: set.title || 'Untitled Question Set',
    subject: set.subject || 'No Subject',
    class: set.class || 'No Class',
    difficulty: set.difficulty || 'medium',
    questionCount: set.questions?.length || 0,
    createdAt: set.createdAt instanceof Date ? set.createdAt.toLocaleDateString() : 'Unknown Date',
    tags: Array.isArray(set.chapters) ? set.chapters : []
  }));

  // Handle edit, delete, and view actions
  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete question set:', id);
    // After confirmation, remove the set from state
    setQuestionSets(prev => prev.filter(set => set.firebaseId !== id));
  };

  const handleView = (id: string) => {
    navigate(`/teacher/content/question-sets/results/${id}`);
  };

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-4 sm:space-y-6 w-full px-2 sm:px-0">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Question Sets
          </h1>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
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
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Content Section */}
        <div className="min-h-[300px] w-full">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6 sm:p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Loading question sets...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6 sm:p-8 text-center">
              <p className="text-red-500 dark:text-red-400">
                {error}
              </p>
            </div>
          ) : formattedSets.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6 sm:p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No question sets found. Create your first question set to get started.
              </p>
              <button
                onClick={() => navigate('/teacher/content/question-sets')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Create New Question Set
              </button>
            </div>
          ) : (
            <div className="transition-all duration-300 w-full">
              {viewMode === 'table' ? (
                <div className="overflow-x-auto -mx-2 sm:-mx-0 rounded-lg">
                  <div className="w-full min-w-[640px]">
                    <QuestionSetsTable
                      sets={formattedSets}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full">
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
