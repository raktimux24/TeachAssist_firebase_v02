import React from 'react';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { BookOpen, Clock, FileText, Users, PenTool } from 'lucide-react';
import OverviewSection from '../../components/shared/dashboard/OverviewSection';
import QuickActions from '../../components/teacher/dashboard/QuickActions';
import RecentLessonPlans from '../../components/teacher/dashboard/RecentLessonPlans';

interface DashboardProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const overviewData = [
  {
    title: "Active Students",
    value: "156",
    icon: Users,
    trend: { value: 12, isPositive: true }
  },
  {
    title: "Lesson Plans",
    value: "24",
    icon: BookOpen,
    trend: { value: 8, isPositive: true }
  },
  {
    title: "Resources Created",
    value: "89",
    icon: FileText,
    trend: { value: 15, isPositive: true }
  },
  {
    title: "Hours Saved",
    value: "45",
    icon: Clock,
    trend: { value: 25, isPositive: true }
  }
];

export default function TeacherDashboard({ isDarkMode, onThemeToggle }: DashboardProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-6">
        <OverviewSection data={overviewData} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <QuickActions />
          <RecentLessonPlans />
        </div>
      </div>
    </TeacherLayout>
  );
}