import React from 'react';
import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import PresentationPreview from '../presentations/components/PresentationPreview';
import PresentationActions from '../presentations/components/PresentationActions';

interface PresentationsResultsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function PresentationsResults({ isDarkMode, onThemeToggle }: PresentationsResultsProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generated Presentation
          </h1>
          <PresentationActions />
        </div>
        <PresentationPreview />
      </div>
    </TeacherLayout>
  );
}