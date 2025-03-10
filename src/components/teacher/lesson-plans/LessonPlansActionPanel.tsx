import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LessonPlansActionPanel() {
  return (
    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
      <Link
        to="/teacher/content/lesson-plans"
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Plus className="-ml-1 mr-2 h-5 w-5" />
        Create New Lesson Plan
      </Link>
    </div>
  );
}