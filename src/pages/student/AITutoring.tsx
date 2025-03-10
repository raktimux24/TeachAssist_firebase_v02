import React, { useState } from 'react';
import StudentLayout from '../../components/student/StudentLayout';
import AITutoringSelector from '../../components/student/ai-tutoring/AITutoringSelector';

interface AITutoringProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function AITutoring({ isDarkMode, onThemeToggle }: AITutoringProps) {
  return (
    <StudentLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6">
        <AITutoringSelector />
      </div>
    </StudentLayout>
  );
}