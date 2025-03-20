
import { Eye, Trash2, FileQuestion } from 'lucide-react';

interface QuestionSet {
  id: string;
  title: string;
  subject: string;
  class: string;
  book?: string;
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
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
      {sets.map((set) => (
        <div 
          key={set.id} 
          className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden flex flex-col"
        >
          <div className="p-2 sm:p-4 flex-grow">
            <div className="flex items-start justify-between gap-1">
              <div className="flex items-center min-w-0 max-w-[80%]">
                <div className="flex-shrink-0 p-1 sm:p-2 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mr-1.5 sm:mr-3">
                  <FileQuestion className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 dark:text-white truncate" title={set.title}>
                  {set.title}
                </h3>
              </div>
              <span className={`flex-shrink-0 px-1.5 sm:px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${set.difficulty === 'easy' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : set.difficulty === 'medium' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                {set.difficulty.charAt(0).toUpperCase() + set.difficulty.slice(1)}
              </span>
            </div>
            
            <div className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <div className="flex flex-col xs:grid xs:grid-cols-2 gap-2 xs:gap-3">
                <div className="truncate py-0.5"><span className="font-medium inline-block w-20 xs:w-auto mr-1">Subject:</span> {set.subject}</div>
                <div className="truncate py-0.5"><span className="font-medium inline-block w-20 xs:w-auto mr-1">Class:</span> {set.class}</div>
              </div>
              {set.book && (
                <div className="truncate py-0.5"><span className="font-medium inline-block w-20 xs:w-auto mr-1">Book:</span> {set.book}</div>
              )}
              <div className="flex flex-col xs:grid xs:grid-cols-2 gap-2 xs:gap-3">
                <div className="truncate py-0.5"><span className="font-medium inline-block w-20 xs:w-auto mr-1">Questions:</span> {set.questionCount}</div>
                <div className="truncate py-0.5"><span className="font-medium inline-block w-20 xs:w-auto mr-1">Created:</span> {set.createdAt}</div>
              </div>
            </div>
            
            {set.tags.length > 0 && (
              <div className="mt-1.5 sm:mt-3 flex flex-wrap gap-1">
                {set.tags.slice(0, 2).map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 max-w-full overflow-hidden"
                    title={tag}
                  >
                    <span className="truncate">{tag}</span>
                  </span>
                ))}
                {set.tags.length > 2 && (
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    +{set.tags.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 px-2 sm:px-4 py-1.5 sm:py-3 flex justify-end space-x-2">
            <button
              onClick={() => onView(set.id)}
              className="inline-flex items-center px-2 sm:px-2.5 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-300 dark:bg-primary-900 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              View
            </button>
            <button
              onClick={() => onDelete(set.id)}
              className="inline-flex items-center px-2 sm:px-2.5 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
