import React from 'react';
import { CheckCircle, Clock, Target, BookOpen, Users } from 'lucide-react';

interface LessonPlanSection {
  title: string;
  content: string[];
  duration: string;
}

const mockLessonPlan = {
  title: 'Introduction to Algebra',
  subject: 'Mathematics',
  class: 'Class 10',
  duration: '45 minutes',
  objectives: [
    'Understand basic algebraic concepts',
    'Learn to solve linear equations',
    'Apply algebraic principles to real-world problems',
  ],
  resources: [
    'Textbook: Chapter 3',
    'Interactive whiteboard',
    'Practice worksheets',
    'Online algebra calculator',
  ],
  sections: [
    {
      title: 'Introduction',
      content: [
        'Review of pre-algebra concepts',
        'Introduction to variables and constants',
        'Real-world examples of algebra usage',
      ],
      duration: '10 minutes',
    },
    {
      title: 'Main Content',
      content: [
        'Explanation of algebraic expressions',
        'Demonstration of solving simple equations',
        'Guided practice with basic problems',
        'Group work on problem-solving',
      ],
      duration: '25 minutes',
    },
    {
      title: 'Conclusion',
      content: [
        'Summary of key concepts',
        'Quick assessment questions',
        'Assignment of homework',
      ],
      duration: '10 minutes',
    },
  ],
};

export default function LessonPlanPreview() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      {/* Lesson Plan Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mockLessonPlan.title}
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-1" />
            Generated Successfully
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>{mockLessonPlan.subject} - {mockLessonPlan.class}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>{mockLessonPlan.duration}</span>
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            <span>{mockLessonPlan.objectives.length} Objectives</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            <span>30 Students</span>
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Learning Objectives
        </h3>
        <ul className="space-y-2">
          {mockLessonPlan.objectives.map((objective, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 w-6 text-gray-500 dark:text-gray-400">{index + 1}.</span>
              <span className="text-gray-600 dark:text-gray-300">{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Required Resources */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Required Resources
        </h3>
        <ul className="space-y-2">
          {mockLessonPlan.resources.map((resource, index) => (
            <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mr-3"></div>
              {resource}
            </li>
          ))}
        </ul>
      </div>

      {/* Lesson Sections */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Lesson Plan
        </h3>
        <div className="space-y-6">
          {mockLessonPlan.sections.map((section, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {section.title}
                </h4>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {section.duration}
                </span>
              </div>
              <ul className="space-y-2">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className="flex-shrink-0 w-6 text-gray-500 dark:text-gray-400">
                      {itemIndex + 1}.
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}