import LessonPlanCard from './LessonPlanCard';

interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  class: string;
  book: string;
  duration: string;
  createdAt: string;
  status: 'draft' | 'published';
  tags: string[];
}

interface LessonPlansGridProps {
  plans: LessonPlan[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function LessonPlansGrid({ plans, onEdit, onDelete, onView }: LessonPlansGridProps) {
  if (plans.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No lesson plans found. Create your first lesson plan to get started!</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 px-0">
      {plans.map((plan) => (
        <LessonPlanCard
          key={plan.id}
          plan={plan}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
}