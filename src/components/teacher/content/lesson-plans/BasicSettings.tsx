import { useEffect } from 'react';
import { BookOpen, GraduationCap, Layers } from 'lucide-react';

interface BasicSettingsProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  selectedChapters: string[];
  setSelectedChapters: (value: string[]) => void;
  classes: string[];
  subjects: Record<string, string[]>;
  chapters: Record<string, string[]>;
  isDarkMode?: boolean;
}

export default function BasicSettings({
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  selectedChapters,
  setSelectedChapters,
  classes,
  subjects,
  chapters,
  isDarkMode,
}: BasicSettingsProps) {
  console.log('[BasicSettings] Received isDarkMode:', isDarkMode);
  
  useEffect(() => {
    console.log('[BasicSettings] isDarkMode changed:', isDarkMode);
    console.log('[BasicSettings] document.documentElement.classList:', document.documentElement.classList.contains('dark'));
  }, [isDarkMode]);
  
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
                setSelectedChapters([]);
              }}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <GraduationCap className="h-5 w-5 text-gray-400" />
            </div>
          </div>
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
                setSelectedChapters([]);
              }}
              disabled={!selectedClass}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select a subject</option>
              {selectedClass && subjects[selectedClass]?.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Chapters
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Layers className="h-5 w-5 text-gray-400" />
          </div>
          <div className="pl-10 space-y-2">
            {selectedSubject ? (
              chapters[selectedSubject]?.map((chapter) => (
                <label key={chapter} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedChapters.includes(chapter)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedChapters([...selectedChapters, chapter]);
                      } else {
                        setSelectedChapters(selectedChapters.filter((ch) => ch !== chapter));
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{chapter}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please select a subject to view available chapters
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}