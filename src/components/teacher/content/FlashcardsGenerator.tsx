import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BasicSettings from './flashcards/BasicSettings';
import FlashcardTypeSelector from './flashcards/FlashcardTypeSelector';
import ConfigurationSummary from './flashcards/ConfigurationSummary';
import { fetchClasses, fetchSubjects, fetchBooks, fetchChapters } from '../../../firebase/resources';
import { fetchPdfResources } from '../../../services/resources';
import { generateFlashcards } from '../../../services/openai';
import { saveFlashcardSet } from '../../../firebase/flashcards';
import { useFlashcards } from '../../../context/FlashcardsContext';
import { useAuth } from '../../../contexts/AuthContext';

interface FlashcardsGeneratorProps {}

export default function FlashcardsGenerator({}: FlashcardsGeneratorProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { setError, setFlashcardSet } = useFlashcards();
  
  // Basic settings state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [flashcardType, setFlashcardType] = useState('');
  
  // Data state
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [books, setBooks] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState({
    classes: false,
    subjects: false,
    books: false,
    chapters: false,
    generating: false
  });
  const [localError, setLocalError] = useState({
    classes: '',
    subjects: '',
    books: '',
    chapters: '',
    generating: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  
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
  
  // Fetch books when class and subject change
  useEffect(() => {
    if (!selectedClass || !selectedSubject) {
      setBooks([]);
      return;
    }
    
    const getBooks = async () => {
      setLoading(prev => ({ ...prev, books: true }));
      try {
        const booksData = await fetchBooks(selectedClass, selectedSubject);
        setBooks(booksData);
        setLocalError(prev => ({ ...prev, books: '' }));
      } catch (err) {
        console.error('Error fetching books:', err);
        setLocalError(prev => ({ ...prev, books: 'Failed to load books' }));
      } finally {
        setLoading(prev => ({ ...prev, books: false }));
      }
    };
    
    getBooks();
  }, [selectedClass, selectedSubject]);
  
  // Fetch chapters when book changes
  useEffect(() => {
    if (!selectedClass || !selectedSubject || !selectedBook) {
      setChapters([]);
      return;
    }
    
    const getChapters = async () => {
      setLoading(prev => ({ ...prev, chapters: true }));
      try {
        const chaptersData = await fetchChapters(selectedClass, selectedSubject, selectedBook);
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
  }, [selectedClass, selectedSubject, selectedBook]);
  
  const isSTEMSubject = ['Mathematics', 'Physics', 'Chemistry'].includes(selectedSubject);
  
  const handleGenerate = async () => {
    // Reset any previous errors
    setLocalError(prev => ({ ...prev, generating: '' }));
    setError(null);
    
    // Set loading state
    setLoading(prev => ({ ...prev, generating: true }));
    setIsGenerating(true);
    
    const toastId = 'flashcards-generate';
    
    try {
      if (!currentUser?.uid) {
        throw new Error('User must be logged in to generate flashcards');
      }

      // Show toast notification
      toast.loading('Fetching PDF resources...', { id: toastId });
      
      // 1. Fetch PDF resources for the selected class, subject, and chapters
      const pdfResources = await fetchPdfResources(
        selectedClass,
        selectedSubject,
        selectedChapters,
        selectedBook
      );
      
      if (pdfResources.length === 0) {
        throw new Error('No PDF resources found for the selected criteria');
      }
      
      // Update toast
      toast.loading('Generating flashcards with AI...', { id: toastId });
      
      // 2. Generate flashcards using OpenAI
      const generationOptions = {
        class: selectedClass,
        subject: selectedSubject,
        book: selectedBook,
        chapters: selectedChapters,
        flashcardType,
        resources: pdfResources,
        additionalInstructions: ''
      };

      console.log('Generating flashcards with options:', generationOptions);
      const flashcardSet = await generateFlashcards(generationOptions);
      console.log('Generated flashcard set:', flashcardSet);
      
      // Update toast
      toast.loading('Saving flashcards...', { id: toastId });
      
      // 3. Save flashcard set to Firebase
      const savedFlashcardSet = await saveFlashcardSet({
        ...flashcardSet,
        userId: currentUser.uid,
        generationOptions: {
          class: selectedClass,
          subject: selectedSubject,
          book: selectedBook,
          chapters: selectedChapters,
          flashcardType
        },
        createdAt: new Date()
      });
      
      console.log('Saved flashcard set:', savedFlashcardSet);
      
      // Set the flashcard set in the context
      setFlashcardSet(savedFlashcardSet);
      
      // Update toast and navigate to the flashcard set
      toast.success('Flashcards generated successfully!', { id: toastId });
      navigate('/teacher/content/flashcards/results');
    } catch (err) {
      console.error('Error generating flashcards:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate flashcards';
      setLocalError(prev => ({ ...prev, generating: errorMessage }));
      toast.error(errorMessage, { id: toastId });
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
          Configure your preferences to generate customized flashcards
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-6 space-y-6">
        {/* Basic Settings */}
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
          error={localError}
        />
        
        {/* Flashcard Type Selector */}
        <FlashcardTypeSelector
          selectedType={flashcardType}
          setSelectedType={setFlashcardType}
          isSTEMSubject={isSTEMSubject}
        />
        
        {/* Configuration Summary */}
        <ConfigurationSummary
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          selectedBook={selectedBook}
          selectedChapters={selectedChapters}
          flashcardType={flashcardType}
        />
        
        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              !selectedClass ||
              !selectedSubject ||
              !selectedBook ||
              selectedChapters.length === 0 ||
              !flashcardType ||
              isGenerating
            }
            className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              isGenerating ? 'cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>
        
        {/* Error Message */}
        {localError.generating && (
          <div className="mt-4 text-red-600">{localError.generating}</div>
        )}
        </div>
      </div>
    </div>
  );
}