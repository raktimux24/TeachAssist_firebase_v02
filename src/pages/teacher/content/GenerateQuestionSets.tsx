import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import QuestionSetGenerator from '../../../components/teacher/content/QuestionSetGenerator';

interface GenerateQuestionSetsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function GenerateQuestionSets({ isDarkMode, onThemeToggle }: GenerateQuestionSetsProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6">
        <QuestionSetGenerator />
      </div>
    </TeacherLayout>
  );
}