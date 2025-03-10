import React from 'react';
import LessonPlanCard from './LessonPlanCard';

interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  class: string;
  duration: string;
  createdAt: string;
  status: 'draft' | 'published';
  tags: string[];
}

interface LessonPlansGridProps {
  plans: LessonPlan[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function LessonPlansGrid({ plans, onEdit, onDelete, onView }: LessonPlansGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <LessonPlanCard
          key={plan.id}
          plan={plan}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
}