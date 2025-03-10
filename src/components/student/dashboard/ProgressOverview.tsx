import React from 'react';
import { BookOpen, Clock, Target, Award } from 'lucide-react';
import OverviewCard from '../../shared/dashboard/OverviewCard';

const progressData = [
  {
    title: "Study Hours",
    value: "24",
    icon: Clock,
    trend: { value: 15, isPositive: true }
  },
  {
    title: "Completed Topics",
    value: "12",
    icon: BookOpen,
    trend: { value: 8, isPositive: true }
  },
  {
    title: "Quiz Score Avg",
    value: "85%",
    icon: Target,
    trend: { value: 5, isPositive: true }
  },
  {
    title: "Achievements",
    value: "8",
    icon: Award,
    trend: { value: 2, isPositive: true }
  }
];

export default function ProgressOverview() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {progressData.map((item) => (
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