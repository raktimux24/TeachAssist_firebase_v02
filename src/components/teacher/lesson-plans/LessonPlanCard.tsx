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

interface LessonPlanCardProps {
  plan: LessonPlan;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function LessonPlanCard({ plan, onEdit, onDelete, onView }: LessonPlanCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-2.5 sm:p-4 md:p-5 flex flex-col h-full border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2 sm:mb-3 md:mb-4">
        <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 dark:text-white line-clamp-2 mr-2">
          {plan.title}
        </h3>
        <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
          plan.status === 'published'
            ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
        }`}>
          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
        </span>
      </div>

      <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3 md:mb-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{plan.subject} - {plan.class}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{plan.duration}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{plan.createdAt}</span>
        </div>
      </div>

      {plan.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3 md:mb-4 flex-grow">
          {plan.tags.slice(0, 3).map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate max-w-[100px]">{tag}</span>
            </div>
          ))}
          {plan.tags.length > 3 && (
            <div className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              +{plan.tags.length - 3} more
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-1 sm:space-x-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onView(plan.id)}
          className="p-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          title="View"
          aria-label="View lesson plan"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(plan.id)}
          className="p-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Edit"
          aria-label="Edit lesson plan"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(plan.id)}
          className="p-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Delete"
          aria-label="Delete lesson plan"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}