import React from 'react';
import { Download, RefreshCw, Pencil } from 'lucide-react';

export default function QuestionSetActions() {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => console.log('Edit question set')}
        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Pencil className="h-4 w-4 mr-2" />
        Edit
      </button>
      <button
        onClick={() => console.log('Regenerate question set')}
        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Regenerate
      </button>
      <button
        onClick={() => console.log('Download question set')}
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </button>
    </div>
  );
}