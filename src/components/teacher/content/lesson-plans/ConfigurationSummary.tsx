import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfigurationSummaryProps {
  selectedClass: string;
  selectedSubject: string;
  selectedChapters: string[];
  format: string;
  numberOfClasses: number;
  isDarkMode?: boolean;
}

export default function ConfigurationSummary({
  selectedClass,
  selectedSubject,
  selectedChapters,
  format,
  numberOfClasses,
  isDarkMode,
}: ConfigurationSummaryProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-primary-500 mt-0.5 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Configuration Summary
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedClass && selectedSubject ? (
                <>
                  Generating a {format} lesson plan for {selectedClass} {selectedSubject}
                  {selectedChapters.length > 0 && ` covering ${selectedChapters.join(', ')}`}
                  {` for ${numberOfClasses} ${numberOfClasses === 1 ? 'class' : 'classes'}`}
                </>
              ) : (
                'Please select class and subject to continue'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}