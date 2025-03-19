import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import LessonPlansFilters from '../../components/teacher/lesson-plans/LessonPlansFilters';
import LessonPlansTable from '../../components/teacher/lesson-plans/LessonPlansTable';
import LessonPlansGrid from '../../components/teacher/lesson-plans/LessonPlansGrid';
import LessonPlansActionPanel from '../../components/teacher/lesson-plans/LessonPlansActionPanel';
import { getUserLessonPlans, LessonPlan } from '../../services/lessonPlanGeneration';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutGrid, List, Plus } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  // Fetch lesson plans when component mounts or when user changes
  useEffect(() => {
    const fetchLessonPlans = async () => {
      if (!userInfo?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const plans = await getUserLessonPlans(userInfo.uid);
        setLessonPlans(plans);
      } catch (err) {
        console.error('Error fetching lesson plans:', err);
        setError('Failed to load lesson plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessonPlans();
  }, [userInfo?.uid]);

  // Filter and sort lesson plans based on user selections
  const filteredAndSortedPlans = lessonPlans
    .filter(plan => {
      // Filter by search query (title, subject, class)
      const matchesSearch = searchQuery === '' || 
        (plan.title && plan.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (plan.subject && plan.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (plan.class && plan.class.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (plan.chapters && plan.chapters.some(chapter => chapter.toLowerCase().includes(searchQuery.toLowerCase())));
      
      // Filter by subject
      const matchesSubject = selectedSubject === 'all' || 
        (plan.subject && plan.subject.toLowerCase() === selectedSubject.toLowerCase());
      
      // Filter by class
      const matchesClass = selectedClass === 'all' || 
        (plan.class && plan.class.toLowerCase() === selectedClass.toLowerCase());
      
      // Filter by status (assuming we add a status field to lesson plans in the future)
      const matchesStatus = selectedStatus === 'all'; // For now, we don't have a status field
      
      return matchesSearch && matchesSubject && matchesClass && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by selected sort option
      if (sortBy === 'date') {
        // Handle cases where createdAt might be undefined or not a valid Date
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'subject') {
        return (a.subject || '').localeCompare(b.subject || '');
      }
      return 0;
    });

  // Convert lesson plans to the format expected by the components
  const formattedPlans = filteredAndSortedPlans.map(plan => ({
    id: plan.firebaseId || '',
    title: plan.title || 'Untitled Lesson Plan',
    subject: plan.subject || 'No Subject',
    class: plan.class || 'No Class',
    duration: `${plan.numberOfClasses || 1} ${(plan.numberOfClasses || 1) > 1 ? 'classes' : 'class'}`,
    createdAt: plan.createdAt instanceof Date ? plan.createdAt.toLocaleDateString() : 'Unknown Date',
    status: 'published' as const, // For now, all plans are considered published
    tags: Array.isArray(plan.chapters) ? plan.chapters : []
  }));

  // Handle edit, delete, and view actions
  const handleEdit = (id: string) => {
    navigate(`/teacher/content/lesson-plans/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete lesson plan:', id);
    // After confirmation, remove the plan from state
    setLessonPlans(prev => prev.filter(plan => plan.firebaseId !== id));
  };

  const handleView = (id: string) => {
    navigate(`/teacher/content/lesson-plans/view/${id}`);
  };

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-4 sm:space-y-6 w-full px-4 sm:px-6 md:px-0 max-w-[100vw] overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white truncate">
            Lesson Plans
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 p-1 rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${
                  viewMode === 'table' 
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' 
                    : 'text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400'
                }`}
                title="Table View"
                aria-label="Switch to table view"
              >
                <List className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid' 
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' 
                    : 'text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400'
                }`}
                title="Grid View"
                aria-label="Switch to grid view"
              >
                <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <div className="flex-shrink-0">
              <LessonPlansActionPanel />
            </div>
          </div>
        </div>

        {/* Filters Section */}
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

        {/* Content Section */}
        <div className="min-h-[300px] w-full">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 sm:p-6 md:p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600 mb-3 sm:mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Loading lesson plans...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 sm:p-6 md:p-8 text-center">
              <p className="text-red-500 dark:text-red-400">
                {error}
              </p>
            </div>
          ) : formattedPlans.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 sm:p-6 md:p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No lesson plans found. Create your first lesson plan to get started.
              </p>
              <button
                onClick={() => navigate('/teacher/content/lesson-plans')}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="-ml-1 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create New Lesson Plan
              </button>
            </div>
          ) : (
            <div className="transition-all duration-300 w-full">
              {viewMode === 'table' ? (
                <div className="overflow-x-auto -mx-4 sm:-mx-0 rounded-lg">
                  <div className="w-full min-w-[640px] pb-2">
                    <LessonPlansTable
                      plans={formattedPlans}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full px-1 sm:px-0">
                  <LessonPlansGrid
                    plans={formattedPlans}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}