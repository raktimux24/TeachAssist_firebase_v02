import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import ContentGenerationSelector from '../../../components/teacher/content/ContentGenerationSelector';

interface ContentGenerationProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function ContentGeneration({ isDarkMode, onThemeToggle }: ContentGenerationProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6">
        <ContentGenerationSelector />
      </div>
    </TeacherLayout>
  );
}