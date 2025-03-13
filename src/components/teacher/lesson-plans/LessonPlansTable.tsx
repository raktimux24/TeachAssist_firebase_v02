import { Clock, Calendar, BookOpen, Tag, Eye, Pencil, Trash2 } from 'lucide-react';

interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  class: string;
  duration: string;
  createdAt: string;
  status: 'draft' | 'published';
  tags: string[];
}

interface LessonPlansTableProps {
  plans: LessonPlan[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function LessonPlansTable({ plans, onEdit, onDelete, onView }: LessonPlansTableProps) {
  if (!plans || plans.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No lesson plans found. Create your first lesson plan to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Subject
              </th>
              <th scope="col" className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Class
              </th>
              <th scope="col" className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 max-w-[150px] sm:max-w-[200px] md:max-w-none">
                        {plan.title}
                      </div>
                      <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {plan.subject} - {plan.class}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1 max-w-[150px] sm:max-w-[200px] md:max-w-none">
                        {plan.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate max-w-[60px] sm:max-w-[80px]">{tag}</span>
                          </span>
                        ))}
                        {plan.tags.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            +{plan.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                  {plan.subject}
                </td>
                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                  {plan.class}
                </td>
                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                    {plan.duration}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    plan.status === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                  }`}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </span>
                </td>
                <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                    {plan.createdAt}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                    <button
                      onClick={() => onView(plan.id)}
                      className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      title="View"
                      aria-label="View lesson plan"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(plan.id)}
                      className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      title="Edit"
                      aria-label="Edit lesson plan"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(plan.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      title="Delete"
                      aria-label="Delete lesson plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}