import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, MessageCircle, Compass } from 'lucide-react';

interface QuickAccessButton {
  icon: React.ElementType;
  label: string;
  description: string;
  route: string;
}

const actions: QuickAccessButton[] = [
  {
    icon: Target,
    label: 'Practice Quiz',
    description: 'Test your knowledge',
    route: '/student/quizzes',
  },
  {
    icon: Brain,
    label: 'AI Tutor',
    description: 'Get instant help',
    route: '/student/tutoring',
  },
  {
    icon: MessageCircle,
    label: 'Study Group',
    description: 'Join discussion',
    route: '/student/study-groups',
  },
  {
    icon: Compass,
    label: 'Career Path',
    description: 'Explore options',
    route: '/student/career',
  },
];

export default function QuickAccess() {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Quick Access
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.route)}
              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div className="ml-4 text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  {action.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}