import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BasicSettings from './flashcards/BasicSettings';
import FlashcardTypeSelector from './flashcards/FlashcardTypeSelector';
import AdvancedSettings from './flashcards/AdvancedSettings';
import ConfigurationSummary from './flashcards/ConfigurationSummary';
import { fetchClasses, fetchSubjects, fetchChapters } from '../../../firebase/resources';
import { fetchPdfResources } from '../../../services/resources';
import { generateFlashcards } from '../../../services/openai';
import { saveFlashcardSet } from '../../../firebase/flashcards';
import { useFlashcards } from '../../../context/FlashcardsContext';
import { useAuth } from '../../../contexts/AuthContext';

interface FlashcardsGeneratorProps {
}

const flashcardTypes = [
  {
    id: 'topic-wise',
    label: 'Topic Wise',
    description: 'Flashcards organized by specific topics',
  },
  {
    id: 'concept-wise',
    label: 'Concept Wise',
    description: 'Focus on key concepts and principles',
  },
  {
    id: 'important-questions',
    label: 'Important Questions',
    description: 'Question and answer format for key points',
  },
  {
    id: 'definitions',
    label: 'Definitions',
    description: 'Term and definition pairs',
  },
  {
    id: 'theorems-formulas',
    label: 'Theorems & Formulas',
    description: 'Mathematical and scientific formulas',
  },
];

export default function FlashcardsGenerator({}: FlashcardsGeneratorProps) {
  const navigate = useNavigate();
  const { setFlashcardSet, setIsGenerating, setError } = useFlashcards();
  const { currentUser } = useAuth();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [flashcardType, setFlashcardType] = useState('topic-wise');
  const [includeDefinitions, setIncludeDefinitions] = useState(true);
  const [includeTheorems, setIncludeTheorems] = useState(true);
  const [includeFormulas, setIncludeFormulas] = useState(true);
  const [includeKeyPoints, setIncludeKeyPoints] = useState(true);
  const [includeSummaries, setIncludeSummaries] = useState(true);
  const [includeDiscussionQuestions, setIncludeDiscussionQuestions] = useState(true);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  
  // State for storing data from Firebase
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    classes: false,
    subjects: false,
    chapters: false,
    generating: false
  });
  const [error, setLocalError] = useState({
    classes: '',
    subjects: '',
    chapters: '',
    generating: ''
  });

  // Fetch classes on component mount
  useEffect(() => {
    const getClasses = async () => {
      setLoading(prev => ({ ...prev, classes: true }));
      try {
        const classesData = await fetchClasses();
        setClasses(classesData);
        setLocalError(prev => ({ ...prev, classes: '' }));
      } catch (err) {
        console.error('Error fetching classes:', err);
        setLocalError(prev => ({ ...prev, classes: 'Failed to load classes' }));
      } finally {
        setLoading(prev => ({ ...prev, classes: false }));
      }
    };
    
    getClasses();
  }, []);

  // Fetch subjects when class changes
  useEffect(() => {
    if (!selectedClass) {
      setSubjects([]);
      return;
    }
    
    const getSubjects = async () => {
      setLoading(prev => ({ ...prev, subjects: true }));
      try {
        const subjectsData = await fetchSubjects(selectedClass);
        setSubjects(subjectsData);
        setLocalError(prev => ({ ...prev, subjects: '' }));
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setLocalError(prev => ({ ...prev, subjects: 'Failed to load subjects' }));
      } finally {
        setLoading(prev => ({ ...prev, subjects: false }));
      }
    };
    
    getSubjects();
  }, [selectedClass]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (!selectedClass || !selectedSubject) {
      setChapters([]);
      return;
    }
    
    const getChapters = async () => {
      setLoading(prev => ({ ...prev, chapters: true }));
      try {
        const chaptersData = await fetchChapters(selectedClass, selectedSubject);
        setChapters(chaptersData);
        setLocalError(prev => ({ ...prev, chapters: '' }));
      } catch (err) {
        console.error('Error fetching chapters:', err);
        setLocalError(prev => ({ ...prev, chapters: 'Failed to load chapters' }));
      } finally {
        setLoading(prev => ({ ...prev, chapters: false }));
      }
    };
    
    getChapters();
  }, [selectedClass, selectedSubject]);

  const isSTEMSubject = ['Mathematics', 'Physics', 'Chemistry'].includes(selectedSubject);

  const handleGenerate = async () => {
    // Reset any previous errors
    setLocalError(prev => ({ ...prev, generating: '' }));
    setError(null);
    
    // Set loading state
    setLoading(prev => ({ ...prev, generating: true }));
    setIsGenerating(true);
    
    try {
      // Show toast notification
      toast.loading('Fetching PDF resources...', { id: 'flashcards-generate' });
      
      // 1. Fetch PDF resources for the selected class, subject, and chapters
      const pdfResources = await fetchPdfResources(
        selectedClass,
        selectedSubject,
        selectedChapters
      );
      
      if (pdfResources.length === 0) {
        throw new Error('No PDF resources found for the selected criteria');
      }
      
      // Update toast
      toast.loading('Generating flashcards...', { id: 'flashcards-generate' });
      
      // 2. Create generation options object to save to Firebase
      const generationOptions = {
        class: selectedClass,
        subject: selectedSubject,
        chapters: selectedChapters,
        flashcardType,
        includeDefinitions,
        includeTheorems,
        includeFormulas,
        includeKeyPoints,
        includeSummaries,
        includeDiscussionQuestions,
        additionalInstructions,
        resourceCount: pdfResources.length,
        resourceIds: pdfResources.map(resource => resource.id)
      };
      
      // 3. Generate flashcards using OpenAI
      const flashcardSet = await generateFlashcards({
        class: selectedClass,
        subject: selectedSubject,
        chapters: selectedChapters,
        flashcardType,
        includeDefinitions,
        includeTheorems,
        includeFormulas,
        includeKeyPoints,
        includeSummaries,
        includeDiscussionQuestions,
        additionalInstructions,
        resources: pdfResources
      });
      
      // 4. Store the generated flashcards in context
      setFlashcardSet(flashcardSet);
      
      // 5. Save the flashcards to Firebase
      if (currentUser) {
        await saveFlashcardSet(
          flashcardSet, 
          currentUser.uid, 
          generationOptions
        );
      }
      
      // 6. Show success toast
      toast.success('Flashcards generated successfully!', { id: 'flashcards-generate' });
      
      // 7. Navigate to the results page
      navigate('/teacher/content/flashcards/results');
    } catch (err) {
      console.error('Error generating flashcards:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate flashcards';
      setLocalError(prev => ({ ...prev, generating: errorMessage }));
      setError(errorMessage);
      toast.error(errorMessage, { id: 'flashcards-generate' });
    } finally {
      setLoading(prev => ({ ...prev, generating: false }));
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Generate Flashcards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create interactive flashcards with customized content and formatting
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-6 space-y-6">
          <BasicSettings
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedChapters={selectedChapters}
            setSelectedChapters={setSelectedChapters}
            classes={classes}
            subjects={subjects}
            chapters={chapters}
            loading={{
              classes: loading.classes,
              subjects: loading.subjects,
              chapters: loading.chapters
            }}
            error={{
              classes: error.classes,
              subjects: error.subjects,
              chapters: error.chapters
            }}
          />

          <FlashcardTypeSelector
            flashcardTypes={flashcardTypes}
            selectedType={flashcardType}
            onTypeChange={setFlashcardType}
          />

          <AdvancedSettings
            isSTEMSubject={isSTEMSubject}
            includeDefinitions={includeDefinitions}
            setIncludeDefinitions={setIncludeDefinitions}
            includeTheorems={includeTheorems}
            setIncludeTheorems={setIncludeTheorems}
            includeFormulas={includeFormulas}
            setIncludeFormulas={setIncludeFormulas}
            includeKeyPoints={includeKeyPoints}
            setIncludeKeyPoints={setIncludeKeyPoints}
            includeSummaries={includeSummaries}
            setIncludeSummaries={setIncludeSummaries}
            includeDiscussionQuestions={includeDiscussionQuestions}
            setIncludeDiscussionQuestions={setIncludeDiscussionQuestions}
            additionalInstructions={additionalInstructions}
            setAdditionalInstructions={setAdditionalInstructions}
          />

          <ConfigurationSummary
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            selectedChapters={selectedChapters}
            flashcardType={flashcardType}
          />

          {error.generating && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
              <p className="text-sm">{error.generating}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!selectedClass || !selectedSubject || selectedChapters.length === 0 || loading.generating}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading.generating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Flashcards'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}