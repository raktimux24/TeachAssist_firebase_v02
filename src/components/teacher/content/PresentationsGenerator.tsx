import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import BasicSettings from './presentations/BasicSettings';
import PresentationTypeSelector from './presentations/PresentationTypeSelector';
import AdvancedSettings from './presentations/AdvancedSettings';
import ConfigurationSummary from './presentations/ConfigurationSummary';
import { fetchClasses, fetchSubjects, fetchBooks, fetchChapters, fetchResourcesByChapters } from '../../../firebase/resources';
import { generatePresentation, testOpenAIConnection, PresentationGenerationOptions } from '../../../services/presentationService';
import { Resource } from '../../../types/resource';

interface PresentationsGeneratorProps {
  isDarkMode: boolean;
}

const presentationTypes = [
  {
    id: 'slide-by-slide',
    label: 'Slide by Slide',
    description: 'Detailed content broken down into individual slides',
  },
  {
    id: 'topic-wise',
    label: 'Topic Wise',
    description: 'Content organized by specific topics within chapters',
  },
  {
    id: 'chapter-wise',
    label: 'Chapter Wise',
    description: 'Comprehensive overview of entire chapters',
  },
  {
    id: 'unit-wise',
    label: 'Unit Wise',
    description: 'Broader coverage combining related chapters',
  },
  {
    id: 'lesson-wise',
    label: 'Lesson Wise',
    description: 'Focused content for individual lessons',
  },
  {
    id: 'concept-wise',
    label: 'Concept Wise',
    description: 'Deep dive into specific concepts',
  },
];

export default function PresentationsGenerator({ isDarkMode }: PresentationsGeneratorProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [presentationType, setPresentationType] = useState('slide-by-slide');
  const [slideCount, setSlideCount] = useState(20);
  const [designTemplate, setDesignTemplate] = useState('modern');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  
  // State for storing data from the database
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [books, setBooks] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    classes: false,
    subjects: false,
    books: false,
    chapters: false
  });
  const [error, setError] = useState({
    classes: '',
    subjects: '',
    books: '',
    chapters: ''
  });
  const [generatingPresentation, setGeneratingPresentation] = useState(false);
  const [generationError, setGenerationError] = useState('');

  // Fetch classes on component mount
  useEffect(() => {
    const getClasses = async () => {
      try {
        setLoading(prev => ({ ...prev, classes: true }));
        setError(prev => ({ ...prev, classes: '' }));
        
        const classesData = await fetchClasses();
        setClasses(classesData);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError(prev => ({ ...prev, classes: 'Failed to load classes' }));
      } finally {
        setLoading(prev => ({ ...prev, classes: false }));
      }
    };
    
    getClasses();
  }, []);

  // Fetch subjects when a class is selected
  useEffect(() => {
    const getSubjects = async () => {
      if (!selectedClass) {
        setSubjects([]);
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, subjects: true }));
        setError(prev => ({ ...prev, subjects: '' }));
        
        const subjectsData = await fetchSubjects(selectedClass);
        setSubjects(subjectsData);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError(prev => ({ ...prev, subjects: 'Failed to load subjects' }));
      } finally {
        setLoading(prev => ({ ...prev, subjects: false }));
      }
    };
    
    getSubjects();
  }, [selectedClass]);

  // Fetch books when a subject is selected
  useEffect(() => {
    const getBooks = async () => {
      if (!selectedClass || !selectedSubject) {
        setBooks([]);
        setSelectedBook('');
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, books: true }));
        setError(prev => ({ ...prev, books: '' }));
        
        const booksData = await fetchBooks(selectedClass, selectedSubject);
        setBooks(booksData);
        
        // Reset selected book when subject changes
        setSelectedBook('');
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(prev => ({ ...prev, books: 'Failed to load books' }));
      } finally {
        setLoading(prev => ({ ...prev, books: false }));
      }
    };
    
    getBooks();
  }, [selectedClass, selectedSubject]);

  // Fetch chapters when a book is selected
  useEffect(() => {
    const getChapters = async () => {
      if (!selectedClass || !selectedSubject || !selectedBook) {
        setChapters([]);
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, chapters: true }));
        setError(prev => ({ ...prev, chapters: '' }));
        
        const chaptersData = await fetchChapters(selectedClass, selectedSubject, selectedBook);
        setChapters(chaptersData);
      } catch (err) {
        console.error('Error fetching chapters:', err);
        setError(prev => ({ ...prev, chapters: 'Failed to load chapters' }));
      } finally {
        setLoading(prev => ({ ...prev, chapters: false }));
      }
    };
    
    getChapters();
  }, [selectedClass, selectedSubject, selectedBook]);

  const handleGenerate = async () => {
    // Validate inputs
    if (!selectedClass || !selectedSubject || !selectedBook || selectedChapters.length === 0) {
      setGenerationError('Please select class, subject, book, and at least one chapter');
      return;
    }
    
    try {
      setGeneratingPresentation(true);
      setGenerationError('');
      
      // Log the configuration
      console.log('Presentation configuration:', {
        class: selectedClass,
        subject: selectedSubject,
        book: selectedBook,
        chapters: selectedChapters,
        presentationType,
        slideCount,
        designTemplate,
        additionalInstructions,
        userId: currentUser?.uid,
      });
      
      // Test OpenAI API connection first
      console.log('Testing OpenAI API connection...');
      const isConnected = await testOpenAIConnection();
      if (!isConnected) {
        console.error('OpenAI API connection test failed');
        setGenerationError('Failed to connect to OpenAI API. Please check your API key and try again.');
        return;
      }
      
      // Fetch resources for the selected chapters
      console.log('Fetching resources for selected chapters...');
      const resources: Resource[] = await fetchResourcesByChapters(selectedClass, selectedSubject, selectedChapters, selectedBook);
      
      if (resources.length === 0) {
        console.warn('No resources found for the selected chapters');
      }
      
      // Prepare options for presentation generation
      const options: PresentationGenerationOptions = {
        class: selectedClass,
        subject: selectedSubject,
        book: selectedBook,
        chapters: selectedChapters,
        presentationType,
        slideCount,
        designTemplate,
        additionalInstructions,
        resources
      };
      
      // Generate the presentation
      console.log('Generating presentation with options:', options);
      const presentation = await generatePresentation(options);
      
      // Save the generated presentation and options to sessionStorage
      console.log('Saving presentation to sessionStorage');
      
      // Clear any existing presentation ID and saved flag to ensure this is treated as a new presentation
      sessionStorage.removeItem('presentationId');
      sessionStorage.removeItem('presentationSavedToFirebase');
      
      sessionStorage.setItem('generatedPresentation', JSON.stringify(presentation));
      sessionStorage.setItem('presentationGenerationOptions', JSON.stringify({
        class: selectedClass,
        subject: selectedSubject,
        book: selectedBook,
        chapters: selectedChapters,
        presentationType,
        slideCount,
        designTemplate,
        additionalInstructions,
        timestamp: new Date().toISOString()
      }));
      
      // Navigate to the results page
      navigate('/teacher/content/presentations/results');
    } catch (error) {
      console.error('Error generating presentation:', error);
      setGenerationError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setGeneratingPresentation(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Generate Presentations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create engaging slide decks with customized content and formatting
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-6 space-y-6">
          <BasicSettings
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedBook={selectedBook}
            setSelectedBook={setSelectedBook}
            selectedChapters={selectedChapters}
            setSelectedChapters={setSelectedChapters}
            classes={classes}
            subjects={subjects}
            books={books}
            chapters={chapters}
            loading={loading}
            error={error}
            isDarkMode={isDarkMode}
          />

          <PresentationTypeSelector
            presentationTypes={presentationTypes}
            selectedType={presentationType}
            onTypeChange={setPresentationType}
            isDarkMode={isDarkMode}
          />

          <AdvancedSettings
            slideCount={slideCount}
            setSlideCount={setSlideCount}
            designTemplate={designTemplate}
            setDesignTemplate={setDesignTemplate}
            additionalInstructions={additionalInstructions}
            setAdditionalInstructions={setAdditionalInstructions}
            isDarkMode={isDarkMode}
          />

          <ConfigurationSummary
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            selectedBook={selectedBook}
            selectedChapters={selectedChapters}
            presentationType={presentationType}
            slideCount={slideCount}
            designTemplate={designTemplate}
            isDarkMode={isDarkMode}
          />

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => navigate('/teacher/content')}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!selectedClass || !selectedSubject || !selectedBook || selectedChapters.length === 0 || generatingPresentation}
              className={`px-6 py-2 rounded-lg text-white ${
                !selectedClass || !selectedSubject || !selectedBook || selectedChapters.length === 0 || generatingPresentation
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {generatingPresentation ? 'Generating...' : 'Generate Presentation'}
            </button>
          </div>
          
          {generationError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300">
              <p>{generationError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}