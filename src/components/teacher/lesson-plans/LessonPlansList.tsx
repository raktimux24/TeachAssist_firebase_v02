import { useState } from 'react';
import TeacherLayout from '../TeacherLayout';
import LessonPlansFilters from './LessonPlansFilters';
import LessonPlansActionPanel from './LessonPlansActionPanel';
import LessonPlansGrid from './LessonPlansGrid';
import LessonPlansTable from './LessonPlansTable';
import { ViewIcon, GridIcon } from 'lucide-react';

const mockLessonPlans = [
  {
    id: '1',
    title: 'Introduction to Algebra',
    subject: 'Mathematics',
    class: 'Class 10',
    book: 'Mathematics Textbook',
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
    book: 'Physics Textbook',
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
    book: 'Chemistry Textbook',
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
      <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white truncate">
            Lesson Plans
          </h1>
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
            <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 p-1 rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                aria-label="Grid view"
              >
                <GridIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                aria-label="Table view"
              >
                <ViewIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <LessonPlansActionPanel />
          </div>
        </div>

        <div className="w-full">
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

        <div className="w-full overflow-hidden">
          {viewMode === 'grid' ? (
            <div className="w-full">
              <LessonPlansGrid
                plans={filteredPlans}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            </div>
          ) : (
            <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
              <div className="min-w-[640px] pb-2">
                <LessonPlansTable
                  plans={filteredPlans}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </div>
            </div>
          )}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-6 sm:py-8 md:py-12 bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 px-4">
              No lesson plans found matching your filters.
            </p>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}