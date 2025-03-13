import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import LessonPlanPreview from '../../../components/teacher/content/lesson-plans/results/LessonPlanPreview';
import LessonPlanActions from '../../../components/teacher/content/lesson-plans/results/LessonPlanActions';
import { ArrowLeft } from 'lucide-react';

interface LessonPlanResultsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function LessonPlanResults({ isDarkMode, onThemeToggle }: LessonPlanResultsProps) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/teacher/content/lesson-plans');
  };

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Generator</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Generated Lesson Plan
            </h1>
          </div>
          <div className="mt-4 md:mt-0">
            <LessonPlanActions />
          </div>
        </div>
        <LessonPlanPreview />
      </div>
    </TeacherLayout>
  );
}