// Dashboard component
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { BookOpen, FileText, PenTool, Brain, Presentation } from 'lucide-react';
import ContentStats from '../../components/dashboard/ContentStats';
import { ContentGenerationChart } from '../../components/teacher/dashboard/ContentGenerationChart';
import { ContentGenerationSection } from '../../components/teacher/dashboard/ContentGenerationSection';
import { ContentTypeItem } from '../../types/dashboard';

interface DashboardProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const contentTypes: ContentTypeItem[] = [
  {
    title: 'Question Sets',
    route: '/teacher/content/question-sets',
    icon: PenTool,
    description: 'Create assessments and quizzes for your students'
  },
  {
    title: 'Flash Cards',
    route: '/teacher/content/flashcards',
    icon: Brain,
    description: 'Generate flashcards for student revision'
  },
  {
    title: 'Lesson Plans',
    route: '/teacher/content/lesson-plans',
    icon: BookOpen,
    description: 'Create detailed lesson plans for your classes'
  },
  {
    title: 'Class Notes',
    route: '/teacher/content/notes',
    icon: FileText,
    description: 'Generate comprehensive notes for your lessons'
  },
  {
    title: 'Presentations',
    route: '/teacher/content/presentations',
    icon: Presentation,
    description: 'Create presentation slides for your lessons'
  }
];

export default function TeacherDashboard({ isDarkMode, onThemeToggle }: DashboardProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-6">
        <ContentStats />
        <ContentGenerationChart />
        <ContentGenerationSection contentTypes={contentTypes} />
      </div>
    </TeacherLayout>
  );
}