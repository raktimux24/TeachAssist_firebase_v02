import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import { 
  getLessonPlanById, 
  updateLessonPlan, 
  LessonPlan, 
  LessonPlanSection 
} from '../../../../services/lessonPlanGeneration';
import { ArrowLeft, Save, Trash2, Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface LessonPlanEditProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function LessonPlanEdit({ isDarkMode, onThemeToggle }: LessonPlanEditProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [chaptersText, setChaptersText] = useState('');
  const [numberOfClasses, setNumberOfClasses] = useState(1);
  const [learningObjectives, setLearningObjectives] = useState('');
  const [requiredResources, setRequiredResources] = useState('');
  const [sections, setSections] = useState<LessonPlanSection[]>([]);
  const [activeSectionContent, setActiveSectionContent] = useState('');
  const [activeSectionTitle, setActiveSectionTitle] = useState('');

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
        
        console.log('Loaded lesson plan:', plan);
        setLessonPlan(plan);
        
        // Initialize form state with lesson plan data
        setTitle(plan.title || '');
        setSubject(plan.subject || '');
        setClassGrade(plan.class || '');
        setChaptersText(plan.chapters.join(', ') || '');
        setNumberOfClasses(plan.numberOfClasses || 1);
        setLearningObjectives(plan.learningObjectives || '');
        setRequiredResources(plan.requiredResources || '');
        
        if (plan.sections && plan.sections.length > 0) {
          console.log('Loaded sections:', plan.sections);
          setSections(plan.sections);
        
          // Set the first section as active by default
          const firstSection = plan.sections[0];
          setActiveSection(firstSection.id);
          setActiveSectionTitle(firstSection.title);
          setActiveSectionContent(firstSection.content);
        } else {
          console.log('No sections found, creating default section');
          // Create a default section if none exists
          const defaultSection = {
            id: uuidv4(),
            title: 'Introduction',
            content: ''
          };
          setSections([defaultSection]);
          setActiveSection(defaultSection.id);
          setActiveSectionTitle(defaultSection.title);
          setActiveSectionContent(defaultSection.content);
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

  const saveCurrentSectionChanges = async () => {
    if (!activeSection) return;
    
    console.log('Saving section changes for section:', activeSection);
    console.log('Current title:', activeSectionTitle);
    console.log('Current content:', activeSectionContent);
    
    // Create updated sections array with current changes
    const updatedSections = sections.map(section => {
      if (section.id === activeSection) {
        const updatedSection = {
          ...section,
          title: activeSectionTitle || section.title,
          content: activeSectionContent || section.content
        };
        console.log('Updated section data:', updatedSection);
        return updatedSection;
      }
      return section;
    });
    
    console.log('Setting updated sections:', updatedSections);
    
    // Update both states
    setSections(updatedSections);
    if (lessonPlan) {
      const updatedPlan = {
        ...lessonPlan,
        sections: updatedSections
      };
      setLessonPlan(updatedPlan);
      console.log('Updated lesson plan with new sections:', updatedPlan);
    }
  };

  const handleSectionClick = async (sectionId: string) => {
    // Save current section changes before switching
    if (activeSection) {
      await saveCurrentSectionChanges();
    }
    
    console.log('Switching to section:', sectionId);
    
    // Find the section in the current sections state
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      console.log('Loading section data:', section);
      setActiveSection(sectionId);
      setActiveSectionTitle(section.title || '');
      setActiveSectionContent(section.content || '');
    }
  };

  const handleAddSection = async () => {
    // Save current section changes first
    if (activeSection) {
      await saveCurrentSectionChanges();
    }
    
    const newSectionId = uuidv4();
    const newSection: LessonPlanSection = {
      id: newSectionId,
      title: 'New Section',
      content: ''
    };
    
    console.log('Creating new section:', newSection);
    
    // Update sections state with the new section
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    
    // Update lesson plan state
    if (lessonPlan) {
      const updatedPlan = {
        ...lessonPlan,
        sections: updatedSections
      };
      setLessonPlan(updatedPlan);
      console.log('Updated lesson plan with new section:', updatedPlan);
    }
    
    // Set the new section as active
    setActiveSection(newSectionId);
    setActiveSectionTitle(newSection.title);
    setActiveSectionContent(newSection.content);
    
    console.log('New section activated:', {
      id: newSectionId,
      title: newSection.title,
      content: newSection.content
    });
  };

  // Add effect to save section changes when switching sections or before saving
  useEffect(() => {
    if (activeSection) {
      const currentSection = sections.find(s => s.id === activeSection);
      if (currentSection) {
        setActiveSectionTitle(currentSection.title);
        setActiveSectionContent(currentSection.content || '');
      }
    }
  }, [activeSection, sections]);

  const handleDeleteSection = (sectionId: string) => {
    // Prevent deleting if it's the only section
    if (sections.length <= 1) {
      setError('Cannot delete the only section');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setSections(prevSections => prevSections.filter(section => section.id !== sectionId));
    
    // If the deleted section was active, switch to the first remaining section
    if (activeSection === sectionId && sections.length > 1) {
      const remainingSections = sections.filter(section => section.id !== sectionId);
      const nextSection = remainingSections[0];
      setActiveSection(nextSection.id);
      setActiveSectionTitle(nextSection.title);
      setActiveSectionContent(nextSection.content);
    }
  };

  // Update handleSave to ensure all section changes are saved
  const handleSave = async () => {
    if (!lessonPlan) return;
    
    // Save current section changes first
    await saveCurrentSectionChanges();
    
    // Validate form
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }
    
    if (!classGrade.trim()) {
      setError('Class/Grade is required');
      return;
    }
    
    // Parse chapters from comma-separated text
    const chapters = chaptersText
      .split(',')
      .map(chapter => chapter.trim())
      .filter(chapter => chapter.length > 0);
    
    if (chapters.length === 0) {
      setError('At least one chapter is required');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Get the latest sections state
      const currentSections = sections.map(section => ({
        ...section,
        title: section.title || 'Untitled Section',
        content: section.content || ''
      }));
      
      console.log('Saving lesson plan with sections:', currentSections);
      
      // Create updated lesson plan object
      const updatedLessonPlan: LessonPlan = {
        ...lessonPlan,
        title,
        subject,
        class: classGrade,
        chapters,
        numberOfClasses,
        learningObjectives,
        requiredResources,
        sections: currentSections,
        createdAt: lessonPlan.createdAt
      };
      
      console.log('Final lesson plan to save:', JSON.stringify(updatedLessonPlan, null, 2));
      
      // Update the lesson plan in Firestore
      const success = await updateLessonPlan(updatedLessonPlan);
      
      if (success) {
        setSuccessMessage('Lesson plan saved successfully');
        // Update the local lessonPlan state to reflect the changes
        setLessonPlan(updatedLessonPlan);
        setSections(currentSections); // Ensure sections state is in sync
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to save lesson plan');
      }
    } catch (err) {
      console.error('Error saving lesson plan:', err);
      setError('Failed to save lesson plan. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = () => {
    navigate(`/teacher/content/lesson-plans/view/${id}`);
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
            Back to View
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-1.5 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
            <p className="text-green-700 dark:text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Content area */}
        {loading ? (
          <div className="w-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : lessonPlan ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Lesson plan metadata */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lesson Plan Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Lesson plan title"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Subject"
                  />
                </div>
                
                <div>
                  <label htmlFor="classGrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Class/Grade
                  </label>
                  <input
                    type="text"
                    id="classGrade"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Class/Grade"
                  />
                </div>
                
                <div>
                  <label htmlFor="numberOfClasses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number of Classes
                  </label>
                  <input
                    type="number"
                    id="numberOfClasses"
                    min="1"
                    max="20"
                    value={numberOfClasses}
                    onChange={(e) => setNumberOfClasses(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="chapters" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chapters (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="chapters"
                    value={chaptersText}
                    onChange={(e) => setChaptersText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Chapter 1, Chapter 2, Chapter 3"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="learningObjectives" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Learning Objectives
                  </label>
                  <textarea
                    id="learningObjectives"
                    value={learningObjectives}
                    onChange={(e) => setLearningObjectives(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Learning objectives for this lesson plan"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="requiredResources" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Required Resources
                  </label>
                  <textarea
                    id="requiredResources"
                    value={requiredResources}
                    onChange={(e) => setRequiredResources(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Resources required for this lesson plan"
                  />
                </div>
              </div>
            </div>
            
            {/* Sections editor */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lesson Plan Sections</h2>
                <button
                  onClick={handleAddSection}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sections navigation */}
                <div className="lg:col-span-1">
                  <nav className="space-y-1 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                    {sections.map((section) => (
                      <div 
                        key={section.id}
                        className="flex items-center justify-between"
                      >
                        <button
                          onClick={() => handleSectionClick(section.id)}
                          className={`flex-grow text-left px-3 py-2 rounded-md text-sm font-medium ${
                            activeSection === section.id
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          {section.title}
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full"
                          title="Delete section"
                          aria-label="Delete section"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </nav>
                </div>
                
                {/* Section editor */}
                <div className="lg:col-span-3">
                  {activeSection ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="sectionTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Section Title
                        </label>
                        <input
                          type="text"
                          id="sectionTitle"
                          value={activeSectionTitle}
                          onChange={(e) => setActiveSectionTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Section title"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="sectionContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Section Content
                        </label>
                        <textarea
                          id="sectionContent"
                          value={activeSectionContent}
                          onChange={(e) => setActiveSectionContent(e.target.value)}
                          rows={15}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Section content"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-md text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Select a section to edit its content
                      </p>
                    </div>
                  )}
                </div>
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