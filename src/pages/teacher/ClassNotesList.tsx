import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import ClassNotesFilters from '../../components/teacher/class-notes/ClassNotesFilters';
import ClassNotesTable from '../../components/teacher/class-notes/ClassNotesTable';
import ClassNotesGrid from '../../components/teacher/class-notes/ClassNotesGrid';
import ClassNotesActionPanel from '../../components/teacher/class-notes/ClassNotesActionPanel';
import { getUserNotes, NotesSet } from '../../services/notesGeneration';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutGrid, List, Plus } from 'lucide-react';

interface ClassNotesListProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function ClassNotesList({ isDarkMode, onThemeToggle }: ClassNotesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [classNotes, setClassNotes] = useState<NotesSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  // Fetch class notes when component mounts or when user changes
  useEffect(() => {
    const fetchClassNotes = async () => {
      if (!userInfo?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const notes = await getUserNotes(userInfo.uid);
        setClassNotes(notes);
      } catch (err) {
        console.error('Error fetching class notes:', err);
        setError('Failed to load class notes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassNotes();
  }, [userInfo?.uid]);

  // Filter and sort class notes based on user selections
  const filteredAndSortedNotes = classNotes
    .filter(note => {
      // Filter by search query (title, subject, class)
      const matchesSearch = searchQuery === '' || 
        (note.title && note.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (note.subject && note.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (note.class && note.class.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (note.chapters && note.chapters.some(chapter => chapter.toLowerCase().includes(searchQuery.toLowerCase())));
      
      // Filter by subject
      const matchesSubject = selectedSubject === 'all' || 
        (note.subject && note.subject.toLowerCase() === selectedSubject.toLowerCase());
      
      // Filter by class
      const matchesClass = selectedClass === 'all' || 
        (note.class && note.class.toLowerCase() === selectedClass.toLowerCase());
      
      // Filter by note type
      const matchesType = selectedType === 'all' || 
        (note.type && note.type.toLowerCase() === selectedType.toLowerCase());
      
      return matchesSearch && matchesSubject && matchesClass && matchesType;
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

  // Convert class notes to the format expected by the components
  const formattedNotes = filteredAndSortedNotes.map(note => ({
    id: note.firebaseId || '',
    title: note.title || 'Untitled Class Notes',
    subject: note.subject || 'No Subject',
    class: note.class || 'No Class',
    type: note.type || 'standard',
    layout: note.layout || 'one-column',
    notesCount: note.notes?.length || 0,
    createdAt: note.createdAt instanceof Date ? note.createdAt.toLocaleDateString() : 'Unknown Date',
    tags: Array.isArray(note.chapters) ? note.chapters : []
  }));

  // Handle delete and view actions
  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete class notes:', id);
    // After confirmation, remove the notes from state
    setClassNotes(prev => prev.filter(note => note.firebaseId !== id));
  };

  const handleView = (id: string) => {
    // Navigate to the class notes view page
    navigate(`/teacher/content/notes/view/${id}`);
  };

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-4 sm:space-y-6 w-full px-4 sm:px-6 md:px-0 max-w-[100vw] overflow-hidden">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              Class Notes
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
                <ClassNotesActionPanel />
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <ClassNotesFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Content Section */}
          <div className="min-h-[300px] w-full">
            {loading ? (
              <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg p-4 sm:p-6 md:p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600 mb-3 sm:mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading class notes...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg p-4 sm:p-6 md:p-8 text-center">
                <p className="text-red-500 dark:text-red-400">
                  {error}
                </p>
              </div>
            ) : formattedNotes.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg p-4 sm:p-6 md:p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No class notes found. Create your first class notes to get started.
                </p>
                <button
                  onClick={() => navigate('/teacher/content/notes')}
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="-ml-1 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Create New Class Notes
                </button>
              </div>
            ) : viewMode === 'table' ? (
              <div className="transition-all duration-300 w-full px-1 sm:px-0">
                <div className="overflow-x-auto -mx-4 sm:-mx-0 rounded-lg">
                  <div className="w-full min-w-[640px] pb-2">
                    <ClassNotesTable
                      notes={formattedNotes}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="transition-all duration-300 w-full px-1 sm:px-0">
                <ClassNotesGrid
                  notes={formattedNotes}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
