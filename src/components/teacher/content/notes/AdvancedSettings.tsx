import React from 'react';
import { Settings, List, Columns } from 'lucide-react';

interface AdvancedSettingsProps {
  layout: 'one-column' | 'two-column';
  setLayout: (layout: 'one-column' | 'two-column') => void;
  isSTEMSubject: boolean;
  includeDefinitions: boolean;
  setIncludeDefinitions: (value: boolean) => void;
  includeTheorems: boolean;
  setIncludeTheorems: (value: boolean) => void;
  includeFormulas: boolean;
  setIncludeFormulas: (value: boolean) => void;
  includeKeyPoints: boolean;
  setIncludeKeyPoints: (value: boolean) => void;
  includeSummaries: boolean;
  setIncludeSummaries: (value: boolean) => void;
  includeDiscussionQuestions: boolean;
  setIncludeDiscussionQuestions: (value: boolean) => void;
  additionalInstructions: string;
  setAdditionalInstructions: (value: string) => void;
}

export default function AdvancedSettings({
  layout,
  setLayout,
  isSTEMSubject,
  includeDefinitions,
  setIncludeDefinitions,
  includeTheorems,
  setIncludeTheorems,
  includeFormulas,
  setIncludeFormulas,
  includeKeyPoints,
  setIncludeKeyPoints,
  includeSummaries,
  setIncludeSummaries,
  includeDiscussionQuestions,
  setIncludeDiscussionQuestions,
  additionalInstructions,
  setAdditionalInstructions,
}: AdvancedSettingsProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center mb-4">
        <Settings className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Advanced Settings
        </h3>
      </div>

      {/* Layout Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Layout
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="one-column"
              checked={layout === 'one-column'}
              onChange={(e) => setLayout(e.target.value as 'one-column')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <List className="h-5 w-5 ml-2 mr-1 text-gray-400" />
            <span className="ml-2 text-gray-700 dark:text-gray-300">One Column</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="two-column"
              checked={layout === 'two-column'}
              onChange={(e) => setLayout(e.target.value as 'two-column')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <Columns className="h-5 w-5 ml-2 mr-1 text-gray-400" />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Two Column</span>
          </label>
        </div>
      </div>

      {/* Content Options */}
      <div className="space-y-4">
        {isSTEMSubject ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeDefinitions}
                onChange={(e) => setIncludeDefinitions(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Include Definitions</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeTheorems}
                onChange={(e) => setIncludeTheorems(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Include Theorems</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeFormulas}
                onChange={(e) => setIncludeFormulas(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Include Formulas</span>
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeKeyPoints}
                onChange={(e) => setIncludeKeyPoints(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Include Key Points</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeSummaries}
                onChange={(e) => setIncludeSummaries(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Include Summaries</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeDiscussionQuestions}
                onChange={(e) => setIncludeDiscussionQuestions(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Include Discussion Questions</span>
            </label>
          </div>
        )}
      </div>

      {/* Additional Instructions */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Instructions
        </label>
        <textarea
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          placeholder="Any specific requirements or preferences..."
        />
      </div>
    </div>
  );
}