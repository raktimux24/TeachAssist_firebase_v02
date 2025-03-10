import React from 'react';
import { BookOpen, Brain, FileText, PenTool } from 'lucide-react';

interface ActionButton {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

const actions: ActionButton[] = [
  {
    icon: PenTool,
    label: 'Question Sets',
    onClick: () => console.log('Create question sets clicked'),
  },
  {
    icon: Brain,
    label: 'Flash Cards',
    onClick: () => console.log('Generate flash cards clicked'),
  },
  {
    icon: BookOpen,
    label: 'Lesson Plan',
    onClick: () => console.log('New lesson clicked'),
  },
  {
    icon: FileText,
    label: 'Class Notes',
    onClick: () => console.log('Generate class notes clicked'),
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex items-center justify-center gap-2 p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Icon className="h-5 w-5" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}