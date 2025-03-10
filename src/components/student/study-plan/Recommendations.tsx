import React from 'react';
import { AlertCircle, BookOpen, Clock } from 'lucide-react';

const unstudiedSubjects = [
  {
    id: 1,
    subject: 'Biology',
    topic: 'Cell Structure',
    lastStudied: '8 days ago',
    suggestedTime: '45 mins',
    priority: 'high',
  },
  {
    id: 2,
    subject: 'Literature',
    topic: 'Shakespeare\'s Sonnets',
    lastStudied: '7 days ago',
    suggestedTime: '30 mins',
    priority: 'medium',
  },
  {
    id: 3,
    subject: 'Geography',
    topic: 'Climate Patterns',
    lastStudied: '7 days ago',
    suggestedTime: '40 mins',
    priority: 'medium',
  },
];

export default function Recommendations() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Subjects Needing Review
        </h2>

        <div className="grid gap-4">
          {unstudiedSubjects.map((subject) => {
            return (
              <button
                key={subject.id}
                className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex flex-col"
              >
                <div className="flex items-center mb-2">
                  <AlertCircle className={`w-5 h-5 mr-2 ${
                    subject.priority === 'high' 
                      ? 'text-red-500' 
                      : 'text-yellow-500'
                  }`} />
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">
                    {subject.subject} - {subject.topic}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-sm mt-auto">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    Last studied: {subject.lastStudied}
                  </span>
                  <span className="text-primary-600 dark:text-primary-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Suggested: {subject.suggestedTime}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}