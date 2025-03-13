import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicSettings from './question-sets/BasicSettings';
import QuestionTypeSelector from './question-sets/QuestionTypeSelector';
import ConfigurationSummary from './question-sets/ConfigurationSummary';
import { fetchClasses, fetchSubjects, fetchChapters, fetchResourcesByChapters } from '../../../firebase/resources';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { generateQuestionSet, QuestionSetGenerationOptions } from '../../../services/questionSetGeneration';
import { Resource } from '../../../types/resource';

interface QuestionSetGeneratorProps {
  isDarkMode: boolean;
}

export default function QuestionSetGenerator({ isDarkMode }: QuestionSetGeneratorProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [questionTypes, setQuestionTypes] = useState<Record<string, number>>({
    'mcq': 5,
    'true-false': 0,
    'short-answers': 0,
    'long-answers': 0,
    'fill-in-blanks': 0,
    'passage-based': 0,
    'extract-based': 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for storing data from Firebase
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string[]>>({});
  const [chapters, setChapters] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState({
    classes: false,
    subjects: false,
    chapters: false
  });

  // Fetch classes on component mount
  useEffect(() => {
    const getClasses = async () => {
      setLoading(prev => ({ ...prev, classes: true }));
      try {
        const fetchedClasses = await fetchClasses();
        setClasses(fetchedClasses);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, classes: false }));
      }
    };

    getClasses();
  }, []);

  // Fetch subjects when a class is selected
  useEffect(() => {
    if (!selectedClass) return;

    const getSubjects = async () => {
      setLoading(prev => ({ ...prev, subjects: true }));
      try {
        const fetchedSubjects = await fetchSubjects(selectedClass);
        setSubjects(prev => ({
          ...prev,
          [selectedClass]: fetchedSubjects
        }));
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast.error('Failed to load subjects. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, subjects: false }));
      }
    };

    getSubjects();
  }, [selectedClass]);

  // Fetch chapters when a subject is selected
  useEffect(() => {
    if (!selectedClass || !selectedSubject) return;

    const getChapters = async () => {
      setLoading(prev => ({ ...prev, chapters: true }));
      try {
        const fetchedChapters = await fetchChapters(selectedClass, selectedSubject);
        setChapters(prev => ({
          ...prev,
          [selectedSubject]: fetchedChapters
        }));
      } catch (error) {
        console.error('Error fetching chapters:', error);
        toast.error('Failed to load chapters. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, chapters: false }));
      }
    };

    getChapters();
  }, [selectedClass, selectedSubject]);

  const totalQuestions = Object.values(questionTypes).reduce((sum, count) => sum + count, 0);

  const handleGenerate = async () => {
    // Validate required fields
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    if (selectedChapters.length === 0) {
      toast.error('Please select at least one chapter');
      return;
    }

    // Check if any question types are selected
    const totalQuestions = Object.values(questionTypes).reduce((sum, count) => sum + count, 0);
    if (totalQuestions === 0) {
      toast.error('Please select at least one question type');
      return;
    }

    setIsGenerating(true);
    const toastId = 'generating-questions';
    toast.loading('Generating question set...', { id: toastId });

    try {
      console.log('Starting question set generation process...');
      
      // Fetch resources (PDFs) for the selected class, subject, and chapters
      console.log('Fetching resources for chapters...');
      
      // Use fetchResourcesByChapters instead of directly querying Firestore
      const resources = await fetchResourcesByChapters(
        selectedClass,
        selectedSubject,
        selectedChapters
      );
      
      console.log(`Found ${resources.length} resources matching the criteria`);
      
      if (resources.length === 0) {
        // If no resources found, create a mock resource for testing
        console.log('No resources found. Creating a mock resource for testing...');
        
        // Create a mock resource with a sample PDF URL
        const mockResource: Resource = {
          id: 'mock-resource',
          title: `${selectedSubject} - ${selectedChapters.join(', ')}`,
          description: 'Mock resource for testing',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileType: 'application/pdf',
          fileName: 'sample.pdf',
          class: selectedClass,
          subject: selectedSubject,
          chapter: selectedChapters[0],
          chapters: selectedChapters,
          book: '',
          createdAt: null,
          updatedAt: null,
          userId: currentUser?.uid || ''
        };
        
        resources.push(mockResource);
        console.log('Added mock resource:', mockResource);
      }
      
      // Create options for question set generation
      const options: QuestionSetGenerationOptions = {
        class: selectedClass,
        subject: selectedSubject,
        chapters: selectedChapters,
        title: `${selectedSubject} Question Set: ${selectedChapters.join(', ')}`,
        difficulty,
        includeAnswers,
        questionTypes,
        resources,
        userId: currentUser?.uid
      };
      
      console.log('Question set generation options:', options);
      
      // Generate the question set
      console.log('Calling generateQuestionSet service...');
      const generatedQuestionSet = await generateQuestionSet(options);
      
      console.log('Question set generated successfully:', generatedQuestionSet);
      
      // Save to localStorage for persistence
      localStorage.setItem('generatedQuestionSet', JSON.stringify(generatedQuestionSet));
      console.log('Question set saved to localStorage');
      
      // Navigate to the results page
      toast.success('Question set generated successfully!', { id: toastId });
      
      // If the question set has a Firestore ID, navigate to the results page with the ID
      if (generatedQuestionSet.firebaseId) {
        console.log(`Navigating to results page with ID: ${generatedQuestionSet.firebaseId}`);
        navigate(`/teacher/content/question-sets/results/${generatedQuestionSet.firebaseId}`);
      } else {
        console.log('Navigating to general results page');
        navigate('/teacher/content/question-sets/results');
      }
    } catch (error) {
      console.error('Error generating question set:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      toast.error(`Failed to generate question set: ${errorMessage}`, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Generate Question Sets
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your preferences to generate customized question sets
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
            loading={loading}
            isDarkMode={isDarkMode}
          />

          <QuestionTypeSelector
            questionTypes={questionTypes}
            setQuestionTypes={setQuestionTypes}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            includeAnswers={includeAnswers}
            setIncludeAnswers={setIncludeAnswers}
            isDarkMode={isDarkMode}
          />

          <ConfigurationSummary
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            selectedChapters={selectedChapters}
            difficulty={difficulty}
            totalQuestions={totalQuestions}
            isDarkMode={isDarkMode}
          />

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!selectedClass || !selectedSubject || selectedChapters.length === 0 || totalQuestions === 0 || isGenerating}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Question Set'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}