import React from 'react';
import StudentLayout from '../../components/student/StudentLayout';
import StudyPlanOverview from '../../components/student/study-plan/StudyPlanOverview';
import StudyProgress from '../../components/student/study-plan/StudyProgress';
import Recommendations from '../../components/student/study-plan/Recommendations';

interface StudyPlanProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function StudyPlan({ isDarkMode, onThemeToggle }: StudyPlanProps) {
  return (
    <StudentLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-6">
        <StudyPlanOverview />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StudyProgress />
          </div>
          <div>
            <Recommendations />
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}