import React, { useState } from 'react';
import { BookOpen, GraduationCap, Layers, PenTool, FileText, Brain, Presentation } from 'lucide-react';
import { AVAILABLE_CLASSES, AVAILABLE_SUBJECTS } from '../../../types/resource';

interface ContentType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
}

const contentTypes: ContentType[] = [
  {
    id: 'question-sets',
    name: 'Question Sets',
    description: 'Generate multiple-choice or fill-in-the-blank questions aligned to the curriculum',
    icon: PenTool,
    features: ['Multiple choice', 'Fill in the blanks', 'Short answers', 'Automatic grading'],
  },
  {
    id: 'lesson-plans',
    name: 'Lesson Plans',
    description: 'Create comprehensive lesson plans tailored to the selected subject',
    icon: BookOpen,
    features: ['Learning objectives', 'Activity timeline', 'Resource lists', 'Assessment criteria'],
  },
  {
    id: 'class-notes',
    name: 'Class Notes',
    description: 'Produce detailed class notes summarizing key topics',
    icon: FileText,
    features: ['Key concepts', 'Examples', 'Practice problems', 'Visual aids'],
  },
  {
    id: 'presentations',
    name: 'Presentations',
    description: 'Automatically generate engaging slide decks',
    icon: Presentation,
    features: ['Visual slides', 'Speaker notes', 'Interactive elements', 'Export options'],
  },
  {
    id: 'flashcards',
    name: 'Flashcards',
    description: 'Create interactive flashcards for quick revision',
    icon: Brain,
    features: ['Term definitions', 'Concept pairs', 'Image support', 'Review tracking'],
  },
];

// Create class options from AVAILABLE_CLASSES
const classes = AVAILABLE_CLASSES.map(cls => `Class ${cls}`);

// Create subjects mapping for each class
const subjects: Record<string, string[]> = {};
classes.forEach(cls => {
  subjects[cls] = AVAILABLE_SUBJECTS as unknown as string[];
});
const chapters = {
  Mathematics: ['Algebra', 'Geometry', 'Calculus'],
  Physics: ['Mechanics', 'Thermodynamics', 'Optics'],
  Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
  Biology: ['Cell Biology', 'Genetics', 'Evolution'],
};

export default function ContentGenerationSelector() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Content Generation Module
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select your preferences and choose the type of content to generate
        </p>
      </div>

      {/* Selection Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Class
            </label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSubject('');
                  setSelectedChapters([]);
                }}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <GraduationCap className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Subject
            </label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapters([]);
                }}
                disabled={!selectedClass}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a subject</option>
                {selectedClass && subjects[selectedClass as keyof typeof subjects].map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <BookOpen className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Chapter Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Chapters
            </label>
            <div className="relative">
              <select
                multiple
                value={selectedChapters}
                onChange={(e) => setSelectedChapters(
                  Array.from(e.target.selectedOptions, option => option.value)
                )}
                disabled={!selectedSubject}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 h-32"
              >
                {selectedSubject && chapters[selectedSubject as keyof typeof chapters].map((chapter) => (
                  <option key={chapter} value={chapter}>{chapter}</option>
                ))}
              </select>
              <Layers className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Hold Ctrl/Cmd to select multiple chapters
            </p>
          </div>
        </div>
      </div>

      {/* Content Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {type.name}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {type.description}
                </p>

                <div className="space-y-2 mb-6">
                  {type.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>

                <button
                  disabled={!selectedClass || !selectedSubject || selectedChapters.length === 0}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
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