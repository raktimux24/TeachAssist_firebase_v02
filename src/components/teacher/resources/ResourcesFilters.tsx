import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { fetchChapters, fetchClasses, fetchSubjects } from '../../../firebase/resources';

interface ResourcesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedClass: string;
  onClassChange: (classLevel: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  selectedChapter: string;
  onChapterChange: (chapter: string) => void;
}

// Format class strings for database query (e.g., "Class 10" -> "10")
const formatClassForQuery = (classValue: string): string => {
  if (classValue === 'all') return 'all';
  return classValue.replace('Class ', '');
};

export default function ResourcesFilters({
  searchQuery,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedSubject,
  onSubjectChange,
  selectedChapter,
  onChapterChange,
}: ResourcesFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
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
        // Convert "Class X" format to just "X" for the database query
        const classValue = formatClassForQuery(selectedClass);
        const subjectsData = await fetchSubjects(classValue);
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

  // Fetch chapters when class or subject changes
  useEffect(() => {
    const loadChapters = async () => {
      if (selectedClass === 'all' || selectedSubject === 'all') {
        setChapters([]);
        return;
      }

      setLoadingChapters(true);
      try {
        // Convert "Class X" format to just "X" for the database query
        const classValue = formatClassForQuery(selectedClass);
        const chaptersData = await fetchChapters(classValue, selectedSubject);
        setChapters(chaptersData);
        
        // Reset chapter selection if the current selection is not in the new list
        if (selectedChapter !== 'all' && !chaptersData.includes(selectedChapter)) {
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
  }, [selectedClass, selectedSubject, selectedChapter, onChapterChange]);

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm ring-1 ring-gray-900/5">
      <div className="space-y-3">
        {/* Search Input */}
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search resources..."
            />
          </div>
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex-shrink-0 inline-flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 md:hidden whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-1.5" />
            Filters
          </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${!isFiltersOpen ? 'hidden md:grid' : 'grid'}`}>
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            disabled={loadingClasses}
            className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <option value="all">All Classes</option>
            {loadingClasses ? (
              <option value="" disabled>Loading...</option>
            ) : (
              classes.map((cls) => (
                <option key={cls} value={`Class ${cls}`}>
                  {`Class ${cls}`}
                </option>
              ))
            )}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            disabled={loadingSubjects || selectedClass === 'all'}
            className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <option value="all">All Subjects</option>
            {loadingSubjects ? (
              <option value="" disabled>Loading...</option>
            ) : (
              subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))
            )}
          </select>

          {/* Chapter Filter */}
          <select
            value={selectedChapter}
            onChange={(e) => onChapterChange(e.target.value)}
            disabled={loadingChapters || selectedClass === 'all' || selectedSubject === 'all'}
            className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </div>
  );
}