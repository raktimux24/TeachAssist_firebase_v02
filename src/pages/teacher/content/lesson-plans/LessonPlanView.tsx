import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import { getLessonPlanById, LessonPlan, LessonPlanSection } from '../../../../services/lessonPlanGeneration';
import { generateLessonPlanDocument } from '../../../../services/documentGenerator';
import { ArrowLeft, Edit, Download, Clock, Book, Bookmark, Calendar } from 'lucide-react';

interface LessonPlanViewProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function LessonPlanView({ isDarkMode, onThemeToggle }: LessonPlanViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessonPlan = async () => {
      if (!id) {
        setError('Lesson plan ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const plan = await getLessonPlanById(id);
        
        if (!plan) {
          setError('Lesson plan not found');
          setLoading(false);
          return;
        }
        
        setLessonPlan(plan);
        
        // Set the first section as active by default
        if (plan.sections && plan.sections.length > 0) {
          setActiveSection(plan.sections[0].id);
        }
      } catch (err) {
        console.error('Error fetching lesson plan:', err);
        setError('Failed to load lesson plan. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessonPlan();
  }, [id]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const getActiveSectionContent = (): LessonPlanSection | null => {
    if (!lessonPlan || !activeSection) return null;
    return lessonPlan.sections.find(section => section.id === activeSection) || null;
  };

  const handleDownload = () => {
    if (lessonPlan) {
      generateLessonPlanDocument(lessonPlan);
    }
  };

  const handleEditClick = () => {
    if (id) {
      navigate(`/teacher/content/lesson-plans/edit/${id}`);
    }
  };

  const handleBackClick = () => {
    navigate('/teacher/lessons');
  };

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Navigation and action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Lesson Plans
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download
            </button>
            <button
              onClick={handleEditClick}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </button>
          </div>
        </div>

        {/* Content area */}
        {loading ? (
          <div className="w-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        ) : lessonPlan ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar with metadata and section navigation */}
            <div className="lg:col-span-1 space-y-6">
              {/* Lesson plan metadata */}
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lesson Plan Details</h2>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Book className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Subject</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{lessonPlan.subject}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Bookmark className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Class</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{lessonPlan.class}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {lessonPlan.numberOfClasses} {lessonPlan.numberOfClasses > 1 ? 'Classes' : 'Class'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {lessonPlan.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sections navigation */}
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sections</h2>
                
                <nav className="space-y-1">
                  {lessonPlan.sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                        activeSection === section.id
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                {/* Lesson plan title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {lessonPlan.title}
                </h1>
                
                {/* Learning objectives and resources */}
                {lessonPlan.learningObjectives && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Learning Objectives</h2>
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <p className="text-gray-700 dark:text-gray-300">{lessonPlan.learningObjectives}</p>
                    </div>
                  </div>
                )}
                
                {lessonPlan.requiredResources && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Required Resources</h2>
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <p className="text-gray-700 dark:text-gray-300">{lessonPlan.requiredResources}</p>
                    </div>
                  </div>
                )}
                
                {/* Divider */}
                <div className="border-b border-gray-200 dark:border-gray-700 my-6"></div>
                
                {/* Active section content */}
                {getActiveSectionContent() && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {getActiveSectionContent()?.title}
                    </h2>
                    <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none">
                      <div 
                        className="whitespace-pre-line text-gray-700 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: getActiveSectionContent()?.content.replace(/\n/g, '<br />') || '' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">Lesson plan not found</p>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
} 