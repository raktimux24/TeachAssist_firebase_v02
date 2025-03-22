import React, { useState } from 'react';
import { Download, RefreshCw, Pencil } from 'lucide-react';
import { generateDocument } from '../../../../../services/documentGenerator';

interface ClassNotesActionsProps {
  notesData: {
    title: string;
    subject: string;
    class: string;
    type: string;
    layout: string;
    sections: {
      title: string;
      content: string[];
      type: 'text' | 'definition' | 'formula' | 'key-point' | 'summary';
    }[];
  };
}

export default function ClassNotesActions({ notesData }: ClassNotesActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await generateDocument(notesData);
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => console.log('Edit class notes')}
        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Pencil className="h-4 w-4 mr-2" />
        Edit
      </button>
      <button
        onClick={() => console.log('Regenerate class notes')}
        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Regenerate
      </button>
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
          isDownloading ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        <Download className={`h-4 w-4 mr-2 ${isDownloading ? 'animate-bounce' : ''}`} />
        {isDownloading ? 'Downloading...' : 'Download'}
      </button>
    </div>
  );
}