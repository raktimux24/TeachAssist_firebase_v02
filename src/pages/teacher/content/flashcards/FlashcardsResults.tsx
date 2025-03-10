import React from 'react';
import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import FlashcardsPreview from './components/FlashcardsPreview';
import FlashcardsActions from './components/FlashcardsActions';

interface FlashcardsResultsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function FlashcardsResults({ isDarkMode, onThemeToggle }: FlashcardsResultsProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generated Flashcards
          </h1>
          <FlashcardsActions />
        </div>
        <FlashcardsPreview />
      </div>
    </TeacherLayout>
  );
}