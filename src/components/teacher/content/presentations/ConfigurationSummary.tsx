
import { AlertCircle } from 'lucide-react';

interface ConfigurationSummaryProps {
  selectedClass: string;
  selectedSubject: string;
  selectedBook: string;
  selectedChapters: string[];
  presentationType: string;
  slideCount: number;
  designTemplate: string;
  isDarkMode: boolean;
}

export default function ConfigurationSummary({
  selectedClass,
  selectedSubject,
  selectedBook,
  selectedChapters,
  presentationType,
  slideCount,
  designTemplate,
  isDarkMode,
}: ConfigurationSummaryProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-primary-500 mt-0.5 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Configuration Summary
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedClass && selectedSubject && selectedBook ? (
                <>
                  Generating {presentationType.replace('-', ' ')} presentation for {selectedClass} {selectedSubject} ({selectedBook})
                  {selectedChapters.length > 0 && ` covering ${selectedChapters.join(', ')}`}
                  {` with ${slideCount} slides using the ${designTemplate} template`}
                </>
              ) : (
                'Please select class, subject, and book to continue'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}