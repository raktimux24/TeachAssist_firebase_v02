import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Layers, PenTool, FileText, Brain, Presentation, Slash as FlashCard } from 'lucide-react';

interface ContentType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  route: string;
}

const contentTypes: ContentType[] = [
  {
    id: 'question-sets',
    name: 'Question Sets',
    description: 'Generate multiple-choice or fill-in-the-blank questions aligned to the curriculum',
    icon: PenTool,
    features: ['Multiple choice', 'Fill in the blanks', 'Short answers', 'Automatic grading'],
    route: '/teacher/content/question-sets'
  },
  {
    id: 'lesson-plans',
    name: 'Lesson Plans',
    description: 'Create comprehensive lesson plans tailored to the selected subject',
    icon: BookOpen,
    features: ['Learning objectives', 'Activity timeline', 'Resource lists', 'Assessment criteria'],
    route: '/teacher/content/lesson-plans'
  },
  {
    id: 'class-notes',
    name: 'Class Notes',
    description: 'Produce detailed class notes summarizing key topics',
    icon: FileText,
    features: ['Key concepts', 'Examples', 'Practice problems', 'Visual aids'],
    route: '/teacher/content/notes'
  },
  {
    id: 'presentations',
    name: 'Presentations',
    description: 'Automatically generate engaging slide decks',
    icon: Presentation,
    features: ['Visual slides', 'Speaker notes', 'Interactive elements', 'Export options'],
    route: '/teacher/content/presentations'
  },
  {
    id: 'flashcards',
    name: 'Flashcards',
    description: 'Create interactive flashcards for quick revision',
    icon: Brain,
    features: ['Term definitions', 'Concept pairs', 'Image support', 'Review tracking'],
    route: '/teacher/content/flashcards'
  },
];

const classes = ['Class 10', 'Class 11', 'Class 12'];
const subjects = {
  'Class 10': ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
  'Class 11': ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
  'Class 12': ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
};
const chapters = {
  Mathematics: ['Algebra', 'Geometry', 'Calculus'],
  Physics: ['Mechanics', 'Thermodynamics', 'Optics'],
  Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
  Biology: ['Cell Biology', 'Genetics', 'Evolution'],
};

export default function ContentGenerationSelector() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Content Generation Module
        </h1>
      </div>

      {/* Content Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {type.name}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mt-4 flex-1">
                  {type.description}
                </p>

                <button
                  onClick={() => navigate(type.route)}
                  className="w-full flex items-center justify-center px-4 py-2 mt-auto border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Generate {type.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}