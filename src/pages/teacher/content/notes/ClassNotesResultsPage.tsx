import { useParams } from 'react-router-dom';
import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import NotesResults from '../../../../components/teacher/content/notes/NotesResults';

interface ClassNotesResultsPageProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function ClassNotesResultsPage({ isDarkMode, onThemeToggle }: ClassNotesResultsPageProps) {
  const { id } = useParams<{ id: string }>();
  
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6">
        <NotesResults isDarkMode={isDarkMode} noteId={id} />
      </div>
    </TeacherLayout>
  );
}
