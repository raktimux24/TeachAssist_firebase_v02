
import { BookOpen, GraduationCap, Layers, Book } from 'lucide-react';

interface BasicSettingsProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  selectedBook: string;
  setSelectedBook: (value: string) => void;
  selectedChapters: string[];
  setSelectedChapters: (value: string[]) => void;
  classes: string[];
  subjects: string[];
  books: string[];
  chapters: string[];
  loading?: {
    classes: boolean;
    subjects: boolean;
    books: boolean;
    chapters: boolean;
  };
  error?: {
    classes: string;
    subjects: string;
    books: string;
    chapters: string;
  };
  isDarkMode: boolean;
}

export default function BasicSettings({
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  selectedBook,
  setSelectedBook,
  selectedChapters,
  setSelectedChapters,
  classes,
  subjects,
  books,
  chapters,
  loading = { classes: false, subjects: false, books: false, chapters: false },
  error = { classes: '', subjects: '', books: '', chapters: '' },
  isDarkMode,
}: BasicSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Class Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Class
          </label>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSubject('');
                setSelectedBook('');
                setSelectedChapters([]);
              }}
              disabled={loading.classes}
              className={`block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <GraduationCap className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {loading.classes && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>
          {error.classes && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.classes}</p>
          )}
        </div>

        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Subject
          </label>
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedBook('');
                setSelectedChapters([]);
              }}
              disabled={!selectedClass || loading.subjects}
              className={`block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <BookOpen className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {loading.subjects && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>
          {error.subjects && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.subjects}</p>
          )}
        </div>
      </div>

      {/* Book Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Book
        </label>
        <div className="relative">
          <select
            value={selectedBook}
            onChange={(e) => {
              setSelectedBook(e.target.value);
              setSelectedChapters([]);
            }}
            disabled={!selectedSubject || loading.books}
            className={`block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">Select a book</option>
            {books.map((book) => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
          <Book className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {loading.books && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>
        {error.books && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.books}</p>
        )}
      </div>

      {/* Chapter Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Chapters
        </label>
        <div className="relative">
          <select
            multiple
            value={selectedChapters}
            onChange={(e) => setSelectedChapters(
              Array.from(e.target.selectedOptions, option => option.value)
            )}
            disabled={!selectedBook || loading.chapters}
            className={`block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:ring-2 focus:ring-primary-500 h-32 min-h-[8rem] disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {chapters.map((chapter) => (
              <option key={chapter} value={chapter}>{chapter}</option>
            ))}
          </select>
          <Layers className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {loading.chapters && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>
        {error.chapters ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.chapters}</p>
        ) : (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Hold Ctrl/Cmd to select multiple chapters
          </p>
        )}
      </div>
    </div>
  );
}