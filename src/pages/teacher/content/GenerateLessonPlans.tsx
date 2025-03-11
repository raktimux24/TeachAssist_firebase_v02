import { useEffect } from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import LessonPlanGenerator from '../../../components/teacher/content/LessonPlanGenerator';

interface GenerateLessonPlansProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function GenerateLessonPlans({ isDarkMode, onThemeToggle }: GenerateLessonPlansProps) {
  console.log('[GenerateLessonPlans] Received isDarkMode:', isDarkMode);
  
  useEffect(() => {
    console.log('[GenerateLessonPlans] isDarkMode changed:', isDarkMode);
    console.log('[GenerateLessonPlans] document.documentElement.classList:', document.documentElement.classList.contains('dark'));
  }, [isDarkMode]);
  
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6">
        <LessonPlanGenerator isDarkMode={isDarkMode} />
      </div>
    </TeacherLayout>
  );
}