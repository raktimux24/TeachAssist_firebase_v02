import React from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { BookOpen, Clock, FileText, Users, PenTool, Brain, Layers } from 'lucide-react';
import OverviewSection from '../../components/shared/dashboard/OverviewSection';
import QuickActions from '../../components/teacher/dashboard/QuickActions';
import RecentLessonPlans from '../../components/teacher/dashboard/RecentLessonPlans';

interface DashboardProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const overviewData = [
  {
    title: "Active Students",
    value: "156",
    icon: Users,
    trend: { value: 12, isPositive: true }
  },
  {
    title: "Lesson Plans",
    value: "24",
    icon: BookOpen,
    trend: { value: 8, isPositive: true }
  },
  {
    title: "Resources Created",
    value: "89",
    icon: FileText,
    trend: { value: 15, isPositive: true }
  },
  {
    title: "Hours Saved",
    value: "45",
    icon: Clock,
    trend: { value: 25, isPositive: true }
  }
];

interface ContentTypeProps {
  title: string;
  route: string;
  icon: React.ElementType;
  description: string;
}

export default function TeacherDashboard({ isDarkMode, onThemeToggle }: DashboardProps) {
  const navigate = useNavigate();
  
  const contentTypes: ContentTypeProps[] = [
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
      icon: Layers,
      description: 'Create presentation slides for your lessons'
    }
  ];

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-6">
        <OverviewSection data={overviewData} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <QuickActions />
          <RecentLessonPlans />
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Content Generation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentTypes.map((content) => {
              const Icon = content.icon;
              return (
                <div 
                  key={content.title} 
                  onClick={() => navigate(content.route)}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mr-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {content.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {content.description}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => navigate('/teacher/content')} 
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View all content options
            </button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}