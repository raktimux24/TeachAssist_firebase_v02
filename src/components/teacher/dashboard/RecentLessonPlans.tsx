import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface LessonPlan {
  title: string;
  subject: string;
  createdAt: string;
  duration: string;
}

const recentLessonPlans: LessonPlan[] = [
  {
    title: 'Introduction to Algebra',
    subject: 'Mathematics',
    createdAt: '2 days ago',
    duration: '45 mins'
  },
  {
    title: 'Forces and Motion',
    subject: 'Physics',
    createdAt: '3 days ago',
    duration: '60 mins'
  },
  {
    title: 'Chemical Reactions',
    subject: 'Chemistry',
    createdAt: '4 days ago',
    duration: '45 mins'
  }
];

export default function RecentLessonPlans() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Recent Lesson Plans
      </h3>
      <div className="space-y-4">
        {recentLessonPlans.map((plan, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {plan.title}
              </h4>
              <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                {plan.duration}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary-600 dark:text-primary-400">
                {plan.subject}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {plan.createdAt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}