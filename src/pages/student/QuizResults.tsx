import React from 'react';
import StudentLayout from '../../components/student/StudentLayout';
import QuizResultsSummary from '../../components/student/quiz/QuizResultsSummary';
import QuizResultsDetails from '../../components/student/quiz/QuizResultsDetails';
import QuizResultsAnalytics from '../../components/student/quiz/QuizResultsAnalytics';

interface QuizResultsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function QuizResults({ isDarkMode, onThemeToggle }: QuizResultsProps) {
  return (
    <StudentLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <QuizResultsSummary />
              <QuizResultsDetails />
            </div>
            
            {/* Analytics Panel */}
            <div className="lg:col-span-1">
              <QuizResultsAnalytics />
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}