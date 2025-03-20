import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import OverviewSection from '../../components/shared/dashboard/OverviewSection';
import EngagementChart from '../../components/admin/charts/EngagementChart';
import ActivityFeed from '../../components/admin/activity/ActivityFeed';
import { Users, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { DashboardCard } from '../../components/shared/cards/DashboardCard';
import { OverviewDataItem } from '../../types/dashboard';

interface DashboardProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const overviewData: OverviewDataItem[] = [
  {
    title: "Total Users",
    value: "12,345",
    icon: Users,
    trend: { value: 12, isPositive: true }
  },
  {
    title: "Active Sessions",
    value: "2,456",
    icon: Clock,
    trend: { value: 8, isPositive: true }
  },
  {
    title: "Resources Created",
    value: "8,765",
    icon: BookOpen,
    trend: { value: 15, isPositive: true }
  },
  {
    title: "System Alerts",
    value: "2",
    icon: AlertTriangle,
    trend: { value: 5, isPositive: false }
  }
];

const chartData = [
  { name: 'Jan', users: 4000, sessions: 2400 },
  { name: 'Feb', users: 3000, sessions: 1398 },
  { name: 'Mar', users: 2000, sessions: 9800 },
  { name: 'Apr', users: 2780, sessions: 3908 },
  { name: 'May', users: 1890, sessions: 4800 },
  { name: 'Jun', users: 2390, sessions: 3800 },
];

export default function Dashboard({ isDarkMode, onThemeToggle }: DashboardProps) {
  return (
    <AdminLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-4 sm:space-y-6">
        <OverviewSection data={overviewData} />

        <DashboardCard>
          <EngagementChart data={chartData} />
        </DashboardCard>

        <DashboardCard>
          <ActivityFeed />
        </DashboardCard>
      </div>
    </AdminLayout>
  );
}