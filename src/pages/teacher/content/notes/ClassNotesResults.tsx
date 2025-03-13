import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import NotesResults from '../../../../components/teacher/content/notes/NotesResults';

interface ClassNotesResultsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function ClassNotesResults({ isDarkMode, onThemeToggle }: ClassNotesResultsProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="py-6">
        <NotesResults isDarkMode={isDarkMode} />
      </div>
    </TeacherLayout>
  );
}