import React from 'react';
import { Eye, Trash2, FileQuestion } from 'lucide-react';

interface QuestionSet {
  id: string;
  title: string;
  subject: string;
  class: string;
  difficulty: string;
  questionCount: number;
  createdAt: string;
  tags: string[];
}

interface QuestionSetsGridProps {
  sets: QuestionSet[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function QuestionSetsGrid({ sets, onDelete, onView }: QuestionSetsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sets.map((set) => (
        <div 
          key={set.id} 
          className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden flex flex-col"
        >
          <div className="p-4 flex-grow">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mr-3">
                  <FileQuestion className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate" title={set.title}>
                  {set.title}
                </h3>
              </div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${set.difficulty === 'easy' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : set.difficulty === 'medium' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                {set.difficulty.charAt(0).toUpperCase() + set.difficulty.slice(1)}
              </span>
            </div>
            
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-between mb-1">
                <span>{set.subject}</span>
                <span>{set.class}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{set.questionCount} questions</span>
                <span>{set.createdAt}</span>
              </div>
            </div>
            
            {set.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {set.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
                {set.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    +{set.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 px-4 py-3 flex justify-end space-x-3">
            <button
              onClick={() => onView(set.id)}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-300 dark:bg-primary-900 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </button>
            <button
              onClick={() => onDelete(set.id)}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
