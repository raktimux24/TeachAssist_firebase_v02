import React, { useState } from 'react';
import { Bell, Mail, MessageSquare } from 'lucide-react';

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    inAppNotifications: true,
    userUpdates: true,
    resourceUpdates: true,
    systemAlerts: false,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h3>
        
        <div className="space-y-4">
          {/* Notification Channels */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications.emailNotifications}
                onClick={() => handleToggle('emailNotifications')}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500
                  ${notifications.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'}
                `}
              >
                <span
                  aria-hidden="true"
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow
                    ring-0 transition duration-200 ease-in-out
                    ${notifications.emailNotifications ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive push notifications on your device
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications.pushNotifications}
                onClick={() => handleToggle('pushNotifications')}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500
                  ${notifications.pushNotifications ? 'bg-primary-600' : 'bg-gray-200'}
                `}
              >
                <span
                  aria-hidden="true"
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow
                    ring-0 transition duration-200 ease-in-out
                    ${notifications.pushNotifications ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    In-App Notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications within the app
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications.inAppNotifications}
                onClick={() => handleToggle('inAppNotifications')}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500
                  ${notifications.inAppNotifications ? 'bg-primary-600' : 'bg-gray-200'}
                `}
              >
                <span
                  aria-hidden="true"
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow
                    ring-0 transition duration-200 ease-in-out
                    ${notifications.inAppNotifications ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Notification Types */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Notification Types
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  User Updates
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.userUpdates}
                  onClick={() => handleToggle('userUpdates')}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${notifications.userUpdates ? 'bg-primary-600' : 'bg-gray-200'}
                  `}
                >
                  <span
                    aria-hidden="true"
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow
                      ring-0 transition duration-200 ease-in-out
                      ${notifications.userUpdates ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Resource Updates
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.resourceUpdates}
                  onClick={() => handleToggle('resourceUpdates')}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${notifications.resourceUpdates ? 'bg-primary-600' : 'bg-gray-200'}
                  `}
                >
                  <span
                    aria-hidden="true"
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow
                      ring-0 transition duration-200 ease-in-out
                      ${notifications.resourceUpdates ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  System Alerts
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.systemAlerts}
                  onClick={() => handleToggle('systemAlerts')}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${notifications.systemAlerts ? 'bg-primary-600' : 'bg-gray-200'}
                  `}
                >
                  <span
                    aria-hidden="true"
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow
                      ring-0 transition duration-200 ease-in-out
                      ${notifications.systemAlerts ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}