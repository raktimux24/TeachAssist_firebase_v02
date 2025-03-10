import React from 'react';
import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import ClassNotesPreview from './components/ClassNotesPreview';
import ClassNotesActions from './components/ClassNotesActions';

interface ClassNotesResultsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function ClassNotesResults({ isDarkMode, onThemeToggle }: ClassNotesResultsProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generated Class Notes
          </h1>
          <ClassNotesActions />
        </div>
        <ClassNotesPreview />
      </div>
    </TeacherLayout>
  );
}