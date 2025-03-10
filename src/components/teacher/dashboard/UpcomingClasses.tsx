import React from 'react';

interface ClassSession {
  time: string;
  subject: string;
  class: string;
}

const upcomingClasses: ClassSession[] = [
  { time: '10:00 AM', subject: 'Mathematics', class: 'Grade 10-A' },
  { time: '11:30 AM', subject: 'Physics', class: 'Grade 11-B' },
];

export default function UpcomingClasses() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Upcoming Classes
      </h3>
      <div className="space-y-4">
        {upcomingClasses.map((lesson, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {lesson.subject}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lesson.class}
              </p>
            </div>
            <span className="text-primary-600 dark:text-primary-400">
              {lesson.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}