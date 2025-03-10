import React from 'react';
import StudentLayout from '../../components/student/StudentLayout';
import ProgressOverview from '../../components/student/dashboard/ProgressOverview';
import StudyPlanOverview from '../../components/student/dashboard/StudyPlanOverview';
import QuickAccess from '../../components/student/dashboard/QuickAccess';

interface DashboardProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function StudentDashboard({ isDarkMode, onThemeToggle }: DashboardProps) {
  return (
    <StudentLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-6">
        {/* Progress Overview Cards */}
        <ProgressOverview />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Study Plan Overview */}
          <StudyPlanOverview />
          
          {/* Quick Access Tools */}
          <QuickAccess />
        </div>
      </div>
    </StudentLayout>
  );
}