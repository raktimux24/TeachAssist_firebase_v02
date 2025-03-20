import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchChapters, fetchClasses, fetchSubjects, fetchBooks } from '../../../firebase/resources';

interface ResourceFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  selectedBook?: string;
  onBookChange?: (value: string) => void;
  selectedChapter?: string;
  onChapterChange?: (value: string) => void;
}

export default function ResourceFilters({
  searchQuery,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedSubject,
  onSubjectChange,
  selectedBook = 'all',
  onBookChange = () => {},
  selectedChapter,
  onChapterChange,
}: ResourceFiltersProps) {
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [books, setBooks] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Fetch classes on component mount
  useEffect(() => {
    const loadClasses = async () => {
      setLoadingClasses(true);
      try {
        const classesData = await fetchClasses();
        setClasses(classesData);
      } catch (error) {
        console.error('Error loading classes:', error);
        setClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    };

    loadClasses();
  }, []);

  // Fetch subjects when class changes
  useEffect(() => {
    const loadSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const subjectsData = await fetchSubjects(selectedClass);
        setSubjects(subjectsData);
        
        // Reset subject selection if the current selection is not in the new list
        if (selectedSubject !== 'all' && !subjectsData.includes(selectedSubject)) {
          onSubjectChange('all');
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, [selectedClass, selectedSubject, onSubjectChange]);

  // Fetch books when class or subject changes
  useEffect(() => {
    const loadBooks = async () => {
      if (selectedClass === 'all' || selectedSubject === 'all') {
        setBooks([]);
        return;
      }

      setLoadingBooks(true);
      try {
        const booksData = await fetchBooks(selectedClass, selectedSubject);
        setBooks(booksData);
        
        // Reset book selection if the current selection is not in the new list
        if (selectedBook !== 'all' && !booksData.includes(selectedBook)) {
          onBookChange('all');
        }
      } catch (error) {
        console.error('Error loading books:', error);
        setBooks([]);
      } finally {
        setLoadingBooks(false);
      }
    };

    loadBooks();
  }, [selectedClass, selectedSubject, selectedBook, onBookChange]);

  // Fetch chapters when class, subject, or book changes
  useEffect(() => {
    const loadChapters = async () => {
      if (selectedClass === 'all' || selectedSubject === 'all') {
        setChapters([]);
        return;
      }

      setLoadingChapters(true);
      try {
        const chaptersData = await fetchChapters(selectedClass, selectedSubject, selectedBook !== 'all' ? selectedBook : undefined);
        setChapters(chaptersData);
        
        // Reset chapter selection if the current selection is not in the new list
        if (selectedChapter && selectedChapter !== 'all' && !chaptersData.includes(selectedChapter) && onChapterChange) {
          onChapterChange('all');
        }
      } catch (error) {
        console.error('Error loading chapters:', error);
        setChapters([]);
      } finally {
        setLoadingChapters(false);
      }
    };

    loadChapters();
  }, [selectedClass, selectedSubject, selectedBook, selectedChapter, onChapterChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-1">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Search resources..."
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Class Filter */}
        <select
          value={selectedClass}
          onChange={(e) => onClassChange(e.target.value)}
          disabled={loadingClasses}
          className="block w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <option value="all">All Classes</option>
          {loadingClasses ? (
            <option value="" disabled>Loading...</option>
          ) : (
            classes.map((cls) => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))
          )}
        </select>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          disabled={loadingSubjects || selectedClass === 'all'}
          className="block w-full sm:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <option value="all">All Subjects</option>
          {loadingSubjects ? (
            <option value="" disabled>Loading...</option>
          ) : (
            subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))
          )}
        </select>

        {/* Book Filter */}
        <select
          value={selectedBook}
          onChange={(e) => onBookChange(e.target.value)}
          disabled={loadingBooks || selectedClass === 'all' || selectedSubject === 'all'}
          className="block w-full sm:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <option value="all">All Books</option>
          {loadingBooks ? (
            <option value="" disabled>Loading...</option>
          ) : (
            books.map((book) => (
              <option key={book} value={book}>{book}</option>
            ))
          )}
        </select>

        {/* Chapter Filter */}
        {onChapterChange && (
          <select
            value={selectedChapter || 'all'}
            onChange={(e) => onChapterChange(e.target.value)}
            disabled={loadingChapters || selectedClass === 'all' || selectedSubject === 'all'}
            className="block w-full sm:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <option value="all">All Chapters</option>
            {loadingChapters ? (
              <option value="" disabled>Loading...</option>
            ) : (
              chapters.map((chapter) => (
                <option key={chapter} value={chapter}>{chapter}</option>
              ))
            )}
          </select>
        )}
      </div>
    </div>
  );
}