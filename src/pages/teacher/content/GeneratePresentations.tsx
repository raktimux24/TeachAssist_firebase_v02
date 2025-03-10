import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import PresentationsGenerator from '../../../components/teacher/content/PresentationsGenerator';

interface GeneratePresentationsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function GeneratePresentations({ isDarkMode, onThemeToggle }: GeneratePresentationsProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6">
        <PresentationsGenerator />
      </div>
    </TeacherLayout>
  );
}