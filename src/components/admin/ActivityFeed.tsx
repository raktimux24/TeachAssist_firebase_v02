import React from 'react';
import { Clock } from 'lucide-react';

interface Activity {
  id: number;
  user: string;
  action: string;
  timestamp: string;
}

const activities: Activity[] = [
  {
    id: 1,
    user: 'John Doe',
    action: 'Created new lesson plan',
    timestamp: '2 hours ago',
  },
  {
    id: 2,
    user: 'Jane Smith',
    action: 'Updated user permissions',
    timestamp: '4 hours ago',
  },
  {
    id: 3,
    user: 'Mike Johnson',
    action: 'Uploaded new resources',
    timestamp: '5 hours ago',
  },
];

export default function ActivityFeed() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <div className="mt-6 flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index !== activities.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {activity.user}
                          </span>{' '}
                          {activity.action}
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}