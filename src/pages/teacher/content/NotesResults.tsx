import TeacherLayout from '../../../components/teacher/TeacherLayout';
import NotesResults from '../../../components/teacher/content/notes/NotesResults';

interface NotesResultsPageProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function NotesResultsPage({ isDarkMode, onThemeToggle }: NotesResultsPageProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6">
        <NotesResults isDarkMode={isDarkMode} />
      </div>
    </TeacherLayout>
  );
}
