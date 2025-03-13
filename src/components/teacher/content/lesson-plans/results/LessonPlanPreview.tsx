import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Target, BookOpen, Users, AlertCircle } from 'lucide-react';
import { LessonPlan } from '../../../../../services/lessonPlanGeneration';
import ReactMarkdown from 'react-markdown';
import '../../../../../styles/markdown.css';

export default function LessonPlanPreview() {
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedLessonPlan = localStorage.getItem('generatedLessonPlan');
      if (storedLessonPlan) {
        const parsedPlan = JSON.parse(storedLessonPlan);
        setLessonPlan(parsedPlan);
        
        // Set the first section as active by default
        if (parsedPlan.sections && parsedPlan.sections.length > 0) {
          setActiveSection(parsedPlan.sections[0].id);
        }
      } else {
        setError('No lesson plan found. Please generate a new one.');
      }
    } catch (err) {
      console.error('Error loading lesson plan:', err);
      setError('Error loading lesson plan. Please try again.');
    }
  }, []);

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {error}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Return to the lesson plan generator to create a new lesson plan.
        </p>
      </div>
    );
  }

  if (!lessonPlan) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading lesson plan...</p>
      </div>
    );
  }

  const getActiveSection = () => {
    if (!lessonPlan || !activeSection) return null;
    return lessonPlan.sections.find(section => section.id === activeSection) || null;
  };

  const activeContent = getActiveSection();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Lesson Plan Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {lessonPlan.title}
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-1" />
            Generated Successfully
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>{lessonPlan.subject} - {lessonPlan.class}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>{lessonPlan.numberOfClasses} {lessonPlan.numberOfClasses > 1 ? 'Classes' : 'Class'}</span>
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            <span>{lessonPlan.format === 'general' ? 'General' : 'Subject-Specific'}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            <span>{lessonPlan.chapters.length} {lessonPlan.chapters.length > 1 ? 'Chapters' : 'Chapter'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row">
        {/* Table of Contents */}
        <div className="md:w-1/4 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Lesson Plan Sections</h2>
            <ul className="space-y-1">
              {lessonPlan.sections.map(section => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-2 py-1 rounded-md ${
                      activeSection === section.id
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section Content */}
        <div className="md:w-3/4 p-6">
          {activeContent ? (
            <div className="prose dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 max-w-none">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{activeContent.title}</h2>
              <div className="markdown-content">
                <ReactMarkdown>{activeContent.content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Select a section from the lesson plan</p>
          )}
        </div>
      </div>
    </div>
  );
}