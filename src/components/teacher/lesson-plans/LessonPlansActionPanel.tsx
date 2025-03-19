
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LessonPlansActionPanel() {
  return (
    <div className="sm:flex-none">
      <Link
        to="/teacher/content/lesson-plans"
        className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 whitespace-nowrap"
      >
        <Plus className="-ml-1 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        <span>Create New</span>
        <span className="hidden sm:inline"> Lesson Plan</span>
      </Link>
    </div>
  );
}