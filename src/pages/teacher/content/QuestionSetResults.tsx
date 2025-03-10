import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import QuestionSetPreview from '../../../components/teacher/content/question-sets/results/QuestionSetPreview';
import QuestionSetActions from '../../../components/teacher/content/question-sets/results/QuestionSetActions';

interface QuestionSetResultsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function QuestionSetResults({ isDarkMode, onThemeToggle }: QuestionSetResultsProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generated Question Set
          </h1>
          <QuestionSetActions />
        </div>
        <QuestionSetPreview />
      </div>
    </TeacherLayout>
  );
}