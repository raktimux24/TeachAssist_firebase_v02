import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import NotesGenerator from '../../../components/teacher/content/NotesGenerator';

interface GenerateNotesProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function GenerateNotes({ isDarkMode, onThemeToggle }: GenerateNotesProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6">
        <NotesGenerator isDarkMode={isDarkMode} />
      </div>
    </TeacherLayout>
  );
}