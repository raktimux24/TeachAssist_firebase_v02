import { useParams } from 'react-router-dom';
import QuestionSetResultsComponent from '../../../components/teacher/content/question-sets/QuestionSetResults';
import TeacherLayout from '../../../components/teacher/TeacherLayout';

interface QuestionSetResultsPageProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function QuestionSetResultsPage({ isDarkMode, onThemeToggle }: QuestionSetResultsPageProps) {
  const { questionSetId } = useParams<{ questionSetId: string }>();

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <QuestionSetResultsComponent isDarkMode={isDarkMode} questionSetId={questionSetId} />
      </div>
    </TeacherLayout>
  );
}
