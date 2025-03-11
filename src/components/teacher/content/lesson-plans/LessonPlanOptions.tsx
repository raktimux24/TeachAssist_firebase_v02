import React from 'react';
import { Settings } from 'lucide-react';

interface LessonPlanOptionsProps {
  format: 'general' | 'subject-specific';
  setFormat: (format: 'general' | 'subject-specific') => void;
  numberOfClasses: number;
  setNumberOfClasses: (count: number) => void;
  learningObjectives: string;
  setLearningObjectives: (objectives: string) => void;
  requiredResources: string;
  setRequiredResources: (resources: string) => void;
  isDarkMode?: boolean;
}

export default function LessonPlanOptions({
  format,
  setFormat,
  numberOfClasses,
  setNumberOfClasses,
  learningObjectives,
  setLearningObjectives,
  requiredResources,
  setRequiredResources,
  isDarkMode,
}: LessonPlanOptionsProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center mb-4">
        <Settings className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Lesson Plan Options
        </h3>
      </div>

      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Format
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="general"
                checked={format === 'general'}
                onChange={(e) => setFormat(e.target.value as 'general')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">General</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="subject-specific"
                checked={format === 'subject-specific'}
                onChange={(e) => setFormat(e.target.value as 'subject-specific')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Subject-Specific</span>
            </label>
          </div>
        </div>

        {/* Number of Classes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Classes
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={numberOfClasses}
            onChange={(e) => setNumberOfClasses(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Learning Objectives */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Learning Objectives (Optional)
          </label>
          <textarea
            value={learningObjectives}
            onChange={(e) => setLearningObjectives(e.target.value)}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="Enter specific learning objectives..."
          ></textarea>
        </div>

        {/* Required Resources */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Required Resources (Optional)
          </label>
          <textarea
            value={requiredResources}
            onChange={(e) => setRequiredResources(e.target.value)}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="Enter required resources for the lesson..."
          ></textarea>
        </div>
      </div>
    </div>
  );
}