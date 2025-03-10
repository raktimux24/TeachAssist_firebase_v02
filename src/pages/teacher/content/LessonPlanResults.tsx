import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import LessonPlanPreview from '../../../components/teacher/content/lesson-plans/results/LessonPlanPreview';
import LessonPlanActions from '../../../components/teacher/content/lesson-plans/results/LessonPlanActions';

interface LessonPlanResultsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function LessonPlanResults({ isDarkMode, onThemeToggle }: LessonPlanResultsProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generated Lesson Plan
          </h1>
          <LessonPlanActions />
        </div>
        <LessonPlanPreview />
      </div>
    </TeacherLayout>
  );
}