import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  duration: string;
}

const recentLessonPlans: LessonPlan[] = [
  {
    id: 'lp-001',
    title: 'Introduction to Algebra',
    subject: 'Mathematics',
    createdAt: '2 days ago',
    duration: '45 mins'
  },
  {
    id: 'lp-002',
    title: 'Forces and Motion',
    subject: 'Physics',
    createdAt: '3 days ago',
    duration: '60 mins'
  },
  {
    id: 'lp-003',
    title: 'Chemical Reactions',
    subject: 'Chemistry',
    createdAt: '4 days ago',
    duration: '45 mins'
  }
];

export default function RecentLessonPlans() {
  const navigate = useNavigate();

  const handleLessonPlanClick = () => {
    // Navigate to all lesson plans for now
    // Later we can implement specific lesson plan detail pages with IDs
    navigate('/teacher/content/lesson-plans/results');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Recent Lesson Plans
      </h3>
      <div className="space-y-4">
        {recentLessonPlans.map((plan) => (
          <div
            key={plan.id}
            onClick={handleLessonPlanClick}
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
      <div className="mt-4 flex justify-end">
        <button 
          onClick={() => navigate('/teacher/lessons')} 
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          View all lesson plans
        </button>
      </div>
    </div>
  );
}