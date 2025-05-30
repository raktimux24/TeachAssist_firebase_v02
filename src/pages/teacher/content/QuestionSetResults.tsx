import TeacherLayout from '../../../components/teacher/TeacherLayout';
import QuestionSetResultsComponent from '../../../components/teacher/content/question-sets/QuestionSetResults';

interface QuestionSetResultsPageProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function QuestionSetResultsPage({ isDarkMode, onThemeToggle }: QuestionSetResultsPageProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <QuestionSetResultsComponent isDarkMode={isDarkMode} />
      </div>
    </TeacherLayout>
  );
}