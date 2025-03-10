import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import LessonPlanGenerator from '../../../components/teacher/content/LessonPlanGenerator';

interface GenerateLessonPlansProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function GenerateLessonPlans({ isDarkMode, onThemeToggle }: GenerateLessonPlansProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6">
        <LessonPlanGenerator />
      </div>
    </TeacherLayout>
  );
}