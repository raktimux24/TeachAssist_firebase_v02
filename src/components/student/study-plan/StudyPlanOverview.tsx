import React from 'react';
import { BookOpen, Clock, Target, Award } from 'lucide-react';

const milestones = [
  {
    id: 1,
    subject: 'Mathematics',
    topic: 'Algebra Fundamentals',
    status: 'completed',
    progress: 100,
  },
  {
    id: 2,
    subject: 'Physics',
    topic: 'Mechanics',
    status: 'in-progress',
    progress: 60,
  },
  {
    id: 3,
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    status: 'upcoming',
    progress: 0,
  },
];

export default function StudyPlanOverview() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Learning Journey
          </h2>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Update Plan
          </button>
        </div>

        <div className="relative">
          <div className="absolute top-0 left-6 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
          
          <div className="space-y-8">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="relative flex items-center">
                <div className={`
                  absolute left-6 -translate-x-1/2 h-4 w-4 rounded-full border-2
                  ${milestone.status === 'completed' 
                    ? 'bg-green-500 border-green-500' 
                    : milestone.status === 'in-progress'
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}
                `} />
                
                <div className="ml-12">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {milestone.subject}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {milestone.topic}
                  </p>
                  {milestone.status !== 'upcoming' && (
                    <div className="mt-2 h-2 w-48 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}