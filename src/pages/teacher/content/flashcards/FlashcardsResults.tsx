import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import FlashcardsPreview from './components/FlashcardsPreview';
import FlashcardsActions from './components/FlashcardsActions';
import { useFlashcards } from '../../../../context/FlashcardsContext';

interface FlashcardsResultsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function FlashcardsResults({ isDarkMode, onThemeToggle }: FlashcardsResultsProps) {
  const navigate = useNavigate();
  const { flashcardSet } = useFlashcards();

  // Redirect if no flashcards are available
  if (!flashcardSet) {
    navigate('/teacher/content/flashcards');
    return null;
  }

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Flashcards Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and manage your generated flashcards
          </p>
        </div>

        <div className="space-y-6">
          <FlashcardsPreview />
          <FlashcardsActions />
        </div>
      </div>
    </TeacherLayout>
  );
}