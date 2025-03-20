import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchClasses, fetchSubjects, fetchBooks, fetchChapters } from '../../../firebase/resources';

interface LessonPlansFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  selectedClass: string;
  onClassChange: (classLevel: string) => void;
  selectedBook: string;
  onBookChange: (book: string) => void;
  selectedChapter: string;
  onChapterChange: (chapter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { value: 'date', label: 'Date Created' },
  { value: 'title', label: 'Title' },
  { value: 'subject', label: 'Subject' },
];

export default function LessonPlansFilters({
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  selectedClass,
  onClassChange,
  selectedBook,
  onBookChange,
  selectedChapter,
  onChapterChange,
  sortBy,
  onSortChange,
}: LessonPlansFiltersProps) {
  const [classes, setClasses] = useState<string[]>(['all']);
  const [subjects, setSubjects] = useState<string[]>(['all']);
  const [books, setBooks] = useState<string[]>(['all']);
  const [chapters, setChapters] = useState<string[]>(['all']);
  const [loading, setLoading] = useState({
    classes: false,
    subjects: false,
    books: false,
    chapters: false
  });

  // Fetch classes on component mount
  useEffect(() => {
    const getClasses = async () => {
      setLoading(prev => ({ ...prev, classes: true }));
      try {
        const fetchedClasses = await fetchClasses();
        setClasses(['all', ...fetchedClasses]);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(prev => ({ ...prev, classes: false }));
      }
    };

    getClasses();
  }, []);

  // Fetch subjects when a class is selected
  useEffect(() => {
    if (selectedClass === 'all') {
      setSubjects(['all']);
      return;
    }

    const getSubjects = async () => {
      setLoading(prev => ({ ...prev, subjects: true }));
      try {
        const fetchedSubjects = await fetchSubjects(selectedClass);
        setSubjects(['all', ...fetchedSubjects]);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(prev => ({ ...prev, subjects: false }));
      }
    };

    getSubjects();
  }, [selectedClass]);

  // Fetch books when a subject is selected
  useEffect(() => {
    if (selectedClass === 'all' || selectedSubject === 'all') {
      setBooks(['all']);
      return;
    }

    const getBooks = async () => {
      setLoading(prev => ({ ...prev, books: true }));
      try {
        const fetchedBooks = await fetchBooks(selectedClass, selectedSubject);
        setBooks(['all', ...fetchedBooks]);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(prev => ({ ...prev, books: false }));
      }
    };

    getBooks();
  }, [selectedClass, selectedSubject]);

  // Fetch chapters when a book is selected
  useEffect(() => {
    if (selectedClass === 'all' || selectedSubject === 'all' || selectedBook === 'all') {
      setChapters(['all']);
      return;
    }

    const getChapters = async () => {
      setLoading(prev => ({ ...prev, chapters: true }));
      try {
        const fetchedChapters = await fetchChapters(selectedClass, selectedSubject);
        setChapters(['all', ...fetchedChapters]);
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setLoading(prev => ({ ...prev, chapters: false }));
      }
    };

    getChapters();
  }, [selectedClass, selectedSubject, selectedBook]);
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm ring-1 ring-gray-900/5">
      <div className="grid gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search lesson plans..."
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4">
          {/* Class Filter */}
          <div>
            <label htmlFor="class-filter" className="sr-only">Class</label>
            <select
              id="class-filter"
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              className="block w-full pl-2 sm:pl-3 pr-6 sm:pr-8 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading.classes}
            >
              {loading.classes ? (
                <option value="loading">Loading...</option>
              ) : classes.map((classLevel) => (
                <option key={classLevel} value={classLevel}>
                  {classLevel === 'all' ? 'All Classes' : classLevel}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label htmlFor="subject-filter" className="sr-only">Subject</label>
            <select
              id="subject-filter"
              value={selectedSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="block w-full pl-2 sm:pl-3 pr-6 sm:pr-8 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading.subjects || selectedClass === 'all'}
            >
              {loading.subjects ? (
                <option value="loading">Loading...</option>
              ) : subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>

          {/* Book Filter */}
          <div>
            <label htmlFor="book-filter" className="sr-only">Book</label>
            <select
              id="book-filter"
              value={selectedBook}
              onChange={(e) => onBookChange(e.target.value)}
              className="block w-full pl-2 sm:pl-3 pr-6 sm:pr-8 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading.books || selectedClass === 'all' || selectedSubject === 'all'}
            >
              {loading.books ? (
                <option value="loading">Loading...</option>
              ) : books.map((book) => (
                <option key={book} value={book}>
                  {book === 'all' ? 'All Books' : book}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter Filter */}
          <div>
            <label htmlFor="chapter-filter" className="sr-only">Chapter</label>
            <select
              id="chapter-filter"
              value={selectedChapter}
              onChange={(e) => onChapterChange(e.target.value)}
              className="block w-full pl-2 sm:pl-3 pr-6 sm:pr-8 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading.chapters || selectedClass === 'all' || selectedSubject === 'all' || selectedBook === 'all'}
            >
              {loading.chapters ? (
                <option value="loading">Loading...</option>
              ) : chapters.map((chapter) => (
                <option key={chapter} value={chapter}>
                  {chapter === 'all' ? 'All Chapters' : chapter}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort-filter" className="sr-only">Sort by</label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="block w-full pl-2 sm:pl-3 pr-6 sm:pr-8 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}