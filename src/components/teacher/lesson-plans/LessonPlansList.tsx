import React, { useState } from 'react';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import LessonPlansFilters from '../../components/teacher/lesson-plans/LessonPlansFilters';
import LessonPlansActionPanel from '../../components/teacher/lesson-plans/LessonPlansActionPanel';
import LessonPlansGrid from './LessonPlansGrid';
import LessonPlansTable from './LessonPlansTable';
import { ViewIcon, GridIcon } from 'lucide-react';

const mockLessonPlans = [
  {
    id: '1',
    title: 'Introduction to Algebra',
    subject: 'Mathematics',
    class: 'Class 10',
    duration: '45 mins',
    createdAt: '2 days ago',
    status: 'published',
    tags: ['Algebra', 'Basics', 'Interactive'],
  },
  {
    id: '2',
    title: 'Newton\'s Laws of Motion',
    subject: 'Physics',
    class: 'Class 11',
    duration: '60 mins',
    createdAt: '3 days ago',
    status: 'draft',
    tags: ['Physics', 'Mechanics'],
  },
  {
    id: '3',
    title: 'Chemical Bonding',
    subject: 'Chemistry',
    class: 'Class 12',
    duration: '45 mins',
    createdAt: '5 days ago',
    status: 'published',
    tags: ['Chemistry', 'Bonding'],
  }
];

interface LessonPlansListProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function LessonPlansList({ isDarkMode, onThemeToggle }: LessonPlansListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [plans, setPlans] = useState(mockLessonPlans);

  const handleEdit = (id: string) => {
    console.log('Edit lesson plan:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete lesson plan:', id);
  };

  const handleView = (id: string) => {
    console.log('View lesson plan:', id);
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || plan.subject === selectedSubject;
    const matchesClass = selectedClass === 'all' || plan.class === selectedClass;
    const matchesStatus = selectedStatus === 'all' || plan.status === selectedStatus;
    return matchesSearch && matchesSubject && matchesClass && matchesStatus;
  });

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Lesson Plans
          </h1>
          <LessonPlansActionPanel />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1">
            <LessonPlansFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Grid view"
            >
              <GridIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md ${
                viewMode === 'table'
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Table view"
            >
              <ViewIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <LessonPlansGrid
            plans={filteredPlans}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <LessonPlansTable
            plans={filteredPlans}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        )}

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No lesson plans found matching your filters.
            </p>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}