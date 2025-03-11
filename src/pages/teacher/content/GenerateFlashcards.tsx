import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import FlashcardsGenerator from '../../../components/teacher/content/FlashcardsGenerator';

interface GenerateFlashcardsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function GenerateFlashcards({ isDarkMode, onThemeToggle }: GenerateFlashcardsProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6">
        <FlashcardsGenerator isDarkMode={isDarkMode} />
      </div>
    </TeacherLayout>
  );
}