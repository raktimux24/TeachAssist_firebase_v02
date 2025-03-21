import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Grid, Layout } from 'lucide-react';
import TemplatedSlide from '../../../../../components/teacher/content/presentations/TemplatedSlide';
import { templateOptions } from '../../../../../components/teacher/content/presentations/PresentationTemplates';
import { Presentation } from '../../../../../services/presentationService';
import { savePresentation } from '../../../../../firebase/presentations';
import { useAuth } from '../../../../../contexts/AuthContext';

// Fallback mock presentation if none is found in sessionStorage
const mockPresentation = {
  title: 'Introduction to Algebra',
  subject: 'Mathematics',
  class: 'Class 10',
  type: 'Topic Wise',
  template: 'modern', // This should match one of the template IDs in templateOptions
  slides: [
    {
      id: 1,
      title: 'What is Algebra?',
      content: [
        'Definition of Algebra',
        'Historical significance',
        'Real-world applications'
      ],
      notes: 'Start with engaging examples from daily life'
    },
    {
      id: 2,
      title: 'Basic Algebraic Concepts',
      content: [
        'Variables and Constants',
        'Expressions',
        'Equations'
      ],
      notes: 'Use visual representations for each concept'
    },
    {
      id: 3,
      title: 'Solving Simple Equations',
      content: [
        'Step-by-step process',
        'Example problems',
        'Practice exercises'
      ],
      notes: 'Include interactive examples on the board'
    }
  ]
};

export default function PresentationPreview() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'slide' | 'grid'>('slide');
  const [currentTemplate, setCurrentTemplate] = useState(templateOptions[0]);
  const [presentation, setPresentation] = useState<Presentation>(mockPresentation);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const isDarkMode = document.documentElement.classList.contains('dark');
  const { currentUser } = useAuth();

  // Load presentation from sessionStorage on component mount
  useEffect(() => {
    console.log('PresentationPreview: Loading presentation from sessionStorage');
    const savedPresentation = sessionStorage.getItem('generatedPresentation');
    const generationOptions = sessionStorage.getItem('presentationGenerationOptions');
    const presentationId = sessionStorage.getItem('presentationId');
    const presentationSavedToFirebase = sessionStorage.getItem('presentationSavedToFirebase');
    
    console.log('PresentationPreview: presentationId =', presentationId);
    console.log('PresentationPreview: presentationSavedToFirebase =', presentationSavedToFirebase);
    
    if (savedPresentation) {
      console.log('PresentationPreview: Found saved presentation in sessionStorage');
      try {
        const parsedPresentation = JSON.parse(savedPresentation) as Presentation;
        console.log('PresentationPreview: Successfully parsed presentation:', parsedPresentation);
        
        if (!parsedPresentation.slides || !Array.isArray(parsedPresentation.slides) || parsedPresentation.slides.length === 0) {
          console.error('PresentationPreview: Invalid presentation structure - missing or empty slides array');
          setLoadError('The generated presentation has an invalid structure. Please try again.');
          return;
        }
        
        setPresentation(parsedPresentation);
        setLoadError(null);
        
        // Only save to Firebase if:
        // 1. User is logged in
        // 2. We have generation options
        // 3. There's no presentationId (which means it's a new presentation, not loaded from Firebase)
        // 4. The presentation hasn't already been saved to Firebase in this session
        if (currentUser && generationOptions && !presentationId && presentationSavedToFirebase !== 'true') {
          console.log('PresentationPreview: New presentation detected, saving to Firebase...');
          saveToFirebase(parsedPresentation, JSON.parse(generationOptions));
        } else {
          console.log('PresentationPreview: Presentation already has an ID or missing required data, skipping save');
          if (!currentUser) console.log('PresentationPreview: User not logged in');
          if (!generationOptions) console.log('PresentationPreview: Missing generation options');
          if (presentationId) console.log('PresentationPreview: Presentation already has ID:', presentationId);
          if (presentationSavedToFirebase === 'true') console.log('PresentationPreview: Presentation already saved to Firebase in this session');
          
          // If we already have a saved presentation ID, update the save status to show as saved
          if (presentationId || presentationSavedToFirebase === 'true') {
            setSaveStatus('saved');
          }
        }
      } catch (error) {
        console.error('PresentationPreview: Error parsing presentation from sessionStorage:', error);
        console.error('PresentationPreview: Raw saved presentation:', savedPresentation);
        setLoadError('Error loading the generated presentation. Please try again.');
      }
    } else {
      console.log('PresentationPreview: No saved presentation found in sessionStorage, using mock data');
    }
  }, [currentUser]);

  // Save presentation to Firebase
  const saveToFirebase = async (presentationData: Presentation, options: Record<string, any>) => {
    if (!currentUser) {
      console.error('PresentationPreview: Cannot save presentation - user not logged in');
      setSaveStatus('error');
      return;
    }
    
    try {
      console.log('PresentationPreview: Saving presentation to Firebase');
      setSaveStatus('saving');
      
      // Set a flag to indicate that we're in the process of saving to Firebase
      // This prevents other components from triggering additional saves
      sessionStorage.setItem('presentationSavedToFirebase', 'true');
      
      const savedPresentation = await savePresentation(
        presentationData,
        currentUser.uid,
        options
      );
      
      console.log('PresentationPreview: Presentation saved successfully:', savedPresentation);
      setSaveStatus('saved');
      
      // Store the presentation ID to prevent duplicate saves
      sessionStorage.setItem('presentationId', savedPresentation.id);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        if (setSaveStatus) {
          setSaveStatus('idle');
        }
      }, 5000);
    } catch (error) {
      console.error('PresentationPreview: Error saving presentation to Firebase:', error);
      setSaveStatus('error');
    }
  };

  // Find the template based on the presentation template name
  useEffect(() => {
    console.log('PresentationPreview: Setting template based on presentation.template:', presentation.template);
    const template = templateOptions.find(t => t.id === presentation.template);
    if (template) {
      console.log('PresentationPreview: Found matching template:', template.name);
      setCurrentTemplate(template);
    } else {
      console.warn('PresentationPreview: No matching template found for ID:', presentation.template);
      console.log('PresentationPreview: Available templates:', templateOptions.map(t => `${t.id}: ${t.name}`).join(', '));
    }
  }, [presentation.template]);

  const toggleViewMode = () => {
    setViewMode(viewMode === 'slide' ? 'grid' : 'slide');
  };

  const goToPrevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const goToNextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, presentation.slides.length - 1));
  };

  // Render save status message
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="fixed top-4 right-4 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-4 py-2 rounded-lg shadow-md flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving presentation...
          </div>
        );
      case 'saved':
        return (
          <div className="fixed top-4 right-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg shadow-md flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Presentation saved successfully!
          </div>
        );
      case 'error':
        return (
          <div className="fixed top-4 right-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg shadow-md flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Error saving presentation. Please try again.
          </div>
        );
      default:
        return null;
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded">
          <p className="font-bold">Error</p>
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {renderSaveStatus()}
      
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
        {/* Presentation Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {presentation.title}
            </h2>
            <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="mr-2">{presentation.class}</span>
              <span>•</span>
              <span className="mx-2">{presentation.subject}</span>
              <span>•</span>
              <span className="ml-2">{presentation.type}</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={toggleViewMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
              title={viewMode === 'slide' ? 'Switch to Grid View' : 'Switch to Slide View'}
            >
              {viewMode === 'slide' ? <Grid size={20} /> : <Layout size={20} />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {loadError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300">
            <p className="font-medium">Error</p>
            <p>{loadError}</p>
          </div>
        )}

        {/* Presentation Content */}
        <div className="relative">
          {viewMode === 'slide' ? (
            <div className="p-6">
              {/* Current Slide */}
              <div className="aspect-[16/9] w-full max-w-3xl mx-auto overflow-hidden">
                {presentation.slides.length > 0 && (
                  <TemplatedSlide
                    slide={presentation.slides[currentSlide]}
                    template={currentTemplate}
                    isDarkMode={isDarkMode}
                  />
                )}
              </div>

              {/* Slide Navigation */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={goToPrevSlide}
                    disabled={currentSlide === 0}
                    className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="mx-4 text-sm text-gray-700 dark:text-gray-300">
                    Slide {currentSlide + 1} of {presentation.slides.length}
                  </span>
                  <button
                    onClick={goToNextSlide}
                    disabled={currentSlide === presentation.slides.length - 1}
                    className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Speaker Notes */}
              {presentation.slides[currentSlide]?.notes && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Speaker Notes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {presentation.slides[currentSlide].notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {presentation.slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    onClick={() => {
                      setCurrentSlide(index);
                      setViewMode('slide');
                    }}
                    className={`cursor-pointer border ${
                      index === currentSlide
                        ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-50'
                        : 'border-gray-200 dark:border-gray-700'
                    } rounded-md overflow-hidden hover:shadow-md transition-shadow`}
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden bg-white dark:bg-gray-900 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full transform scale-75 origin-center">
                          <TemplatedSlide
                            slide={slide}
                            template={currentTemplate}
                            isDarkMode={isDarkMode}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        {slide.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Slide {index + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}