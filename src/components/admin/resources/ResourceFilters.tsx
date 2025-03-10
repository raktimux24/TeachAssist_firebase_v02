import React from 'react';
import { Search } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  subjects: Subject[];
}

interface Subject {
  id: string;
  name: string;
  books: Book[];
}

interface Book {
  id: string;
  name: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  name: string;
}

interface ResourceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedClass: string;
  onClassChange: (classId: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  selectedBook: string;
  onBookChange: (book: string) => void;
  selectedChapter: string;
  onChapterChange: (chapter: string) => void;
}

const classes: Class[] = [
  {
    id: 'all',
    name: 'All Classes',
    subjects: []
  },
  {
    id: 'class-10',
    name: 'Class 10',
    subjects: [
      {
        id: 'mathematics',
        name: 'Mathematics',
        books: [
          {
            id: 'math-book-1',
            name: 'Advanced Mathematics',
            chapters: [
              { id: 'chapter-1', name: 'Algebra' },
              { id: 'chapter-2', name: 'Geometry' }
            ]
          }
        ]
      },
      {
        id: 'physics',
        name: 'Physics',
        books: [
          {
            id: 'physics-book-1',
            name: 'Physics Fundamentals',
            chapters: [
              { id: 'chapter-1', name: 'Mechanics' },
              { id: 'chapter-2', name: 'Thermodynamics' }
            ]
          }
        ]
      }
    ]
  }
];

export default function ResourceFilters({
  searchQuery,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedSubject,
  onSubjectChange,
  selectedBook,
  onBookChange,
  selectedChapter,
  onChapterChange,
}: ResourceFiltersProps) {
  const currentClass = classes.find(c => c.id === selectedClass) || classes[0];
  const currentSubject = currentClass.subjects.find(s => s.id === selectedSubject);
  const currentBook = currentSubject?.books.find(b => b.id === selectedBook);

  return (
    <div className="flex-1 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search resources..."
          />
        </div>

        {/* Class Filter */}
        <div>
          <select
            value={selectedClass}
            onChange={(e) => {
              onClassChange(e.target.value);
              onSubjectChange('all');
              onBookChange('all');
              onChapterChange('all');
            }}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Subject Filter */}
        <div>
          <select
            value={selectedSubject}
            onChange={(e) => {
              onSubjectChange(e.target.value);
              onBookChange('all');
              onChapterChange('all');
            }}
            disabled={selectedClass === 'all'}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="all">All Subjects</option>
            {currentClass.subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Book and Chapter Group */}
        <div className="grid grid-cols-2 gap-4">
          {/* Book Filter */}
          <div>
            <select
              value={selectedBook}
              onChange={(e) => {
                onBookChange(e.target.value);
                onChapterChange('all');
              }}
              disabled={selectedSubject === 'all'}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="all">All Books</option>
              {currentSubject?.books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter Filter */}
          <div>
            <select
              value={selectedChapter}
              onChange={(e) => onChapterChange(e.target.value)}
              disabled={selectedBook === 'all'}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="all">All Chapters</option>
              {currentBook?.chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}