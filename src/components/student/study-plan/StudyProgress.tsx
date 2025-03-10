import React from 'react';
import { BookMarked, Target } from 'lucide-react';

const subjects = [
  {
    id: 1,
    name: 'Mathematics',
    progress: 75,
    currentChapter: 'Algebra',
    completed: 12,
  },
  {
    id: 2,
    name: 'Physics',
    progress: 60,
    currentChapter: 'Mechanics',
    quizScore: 78,
  },
  {
    id: 3,
    name: 'Chemistry',
    progress: 40,
    currentChapter: 'Organic Chemistry',
    quizScore: 92,
  },
];

export default function StudyProgress() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Progress Tracking
        </h2>

        <div className="space-y-6">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {subject.name}
                </h3>
                <span className="text-primary-600 dark:text-primary-400 font-medium">
                  {subject.progress}%
                </span>
              </div>

              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-4">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${subject.progress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <BookMarked className="w-4 h-4 mr-2" />
                  {subject.currentChapter}
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Target className="w-4 h-4 mr-2" />
                  Quiz Score: {subject.quizScore}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}