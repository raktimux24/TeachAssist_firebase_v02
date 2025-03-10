import React from 'react';
import { Users, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import OverviewCard from './OverviewCard';

const overviewData = [
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

export default function OverviewSection() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {overviewData.map((item) => (
        <OverviewCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          trend={item.trend}
        />
      ))}
    </div>
  );
}