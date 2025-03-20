
import { Eye, Trash2 } from 'lucide-react';

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

interface QuestionSetsTableProps {
  sets: QuestionSet[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function QuestionSetsTable({ sets, onDelete, onView }: QuestionSetsTableProps) {
  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="py-2 sm:py-3.5 pl-2 sm:pl-4 pr-1 sm:pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
              Title
            </th>
            <th scope="col" className="hidden sm:table-cell px-1 sm:px-3 py-2 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
              Subject
            </th>
            <th scope="col" className="hidden md:table-cell px-1 sm:px-3 py-2 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
              Class
            </th>
            <th scope="col" className="hidden lg:table-cell px-1 sm:px-3 py-2 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
              Book
            </th>
            <th scope="col" className="px-1 sm:px-3 py-2 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
              Difficulty
            </th>
            <th scope="col" className="hidden md:table-cell px-1 sm:px-3 py-2 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
              Questions
            </th>
            <th scope="col" className="hidden sm:table-cell px-1 sm:px-3 py-2 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
              Created
            </th>
            <th scope="col" className="relative py-2 sm:py-3.5 pl-1 sm:pl-3 pr-2 sm:pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {sets.map((set) => (
            <tr key={set.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="truncate max-w-[150px] sm:max-w-none py-2 sm:py-4 pl-2 sm:pl-4 pr-1 sm:pr-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                {set.title}
              </td>
              <td className="hidden sm:table-cell whitespace-nowrap px-1 sm:px-3 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {set.subject}
              </td>
              <td className="hidden md:table-cell whitespace-nowrap px-1 sm:px-3 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {set.class}
              </td>
              <td className="hidden lg:table-cell whitespace-nowrap px-1 sm:px-3 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {set.book || '-'}
              </td>
              <td className="whitespace-nowrap px-1 sm:px-3 py-2 sm:py-4 text-xs sm:text-sm">
                <span className={`px-1.5 sm:px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${set.difficulty === 'easy' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                    : set.difficulty === 'medium' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                  {set.difficulty.charAt(0).toUpperCase() + set.difficulty.slice(1)}
                </span>
              </td>
              <td className="hidden md:table-cell whitespace-nowrap px-1 sm:px-3 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {set.questionCount}
              </td>
              <td className="hidden sm:table-cell whitespace-nowrap px-1 sm:px-3 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {set.createdAt}
              </td>
              <td className="relative whitespace-nowrap py-2 sm:py-4 pl-1 sm:pl-3 pr-2 sm:pr-4 text-right text-xs sm:text-sm font-medium sm:pr-6">
                <div className="flex justify-end space-x-1 sm:space-x-2">
                  <button
                    onClick={() => onView(set.id)}
                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1"
                    title="View"
                  >
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">View</span>
                  </button>
                  <button
                    onClick={() => onDelete(set.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
