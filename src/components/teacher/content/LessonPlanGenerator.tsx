import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicSettings from './lesson-plans/BasicSettings';
import LessonPlanOptions from './lesson-plans/LessonPlanOptions';
import ConfigurationSummary from './lesson-plans/ConfigurationSummary';
import { fetchClasses, fetchSubjects, fetchChapters, fetchResourcesByChapters } from '../../../firebase/resources';
import { generateLessonPlan } from '../../../services/lessonPlanGeneration';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';

interface LessonPlanGeneratorProps {
  isDarkMode: boolean;
}

export default function LessonPlanGenerator({ isDarkMode }: LessonPlanGeneratorProps) {
  console.log('[LessonPlanGenerator] Received isDarkMode:', isDarkMode);
  
  useEffect(() => {
    console.log('[LessonPlanGenerator] isDarkMode changed:', isDarkMode);
    console.log('[LessonPlanGenerator] document.documentElement.classList:', document.documentElement.classList.contains('dark'));
  }, [isDarkMode]);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [format, setFormat] = useState<'general' | 'subject-specific'>('general');
  const [numberOfClasses, setNumberOfClasses] = useState(1);
  const [learningObjectives, setLearningObjectives] = useState('');
  const [requiredResources, setRequiredResources] = useState('');
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

  // Load saved options from localStorage if available
  useEffect(() => {
    try {
      const savedOptions = localStorage.getItem('lessonPlanOptions');
      if (savedOptions) {
        const options = JSON.parse(savedOptions);
        setSelectedClass(options.class || '');
        setSelectedSubject(options.subject || '');
        setSelectedChapters(options.chapters || []);
        setFormat(options.format || 'general');
        setNumberOfClasses(options.numberOfClasses || 1);
        setLearningObjectives(options.learningObjectives || '');
        setRequiredResources(options.requiredResources || '');
        
        // Clear the saved options after loading them
        localStorage.removeItem('lessonPlanOptions');
        
        toast.success('Previous lesson plan settings loaded');
      }
    } catch (error) {
      console.error('Error loading saved options:', error);
    }
  }, []);

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

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || selectedChapters.length === 0) {
      toast.error('Please select a class, subject, and at least one chapter');
      return;
    }

    setIsGenerating(true);
    toast.loading('Generating lesson plan...', { id: 'generating-lesson-plan' });

    try {
      // Fetch resources for the selected chapters
      const resources = await fetchResourcesByChapters(selectedClass, selectedSubject, selectedChapters);

      if (resources.length === 0) {
        toast.error('No resources found for the selected chapters. Please select different chapters or contact your administrator.');
        setIsGenerating(false);
        return;
      }

      // Generate lesson plan using the service
      const lessonPlan = await generateLessonPlan({
        title: `${selectedSubject} Lesson Plan: ${selectedChapters.join(', ')}`,
        class: selectedClass,
        subject: selectedSubject,
        chapters: selectedChapters,
        format,
        numberOfClasses,
        learningObjectives,
        requiredResources,
        resources,
        userId: currentUser?.uid // Pass the user ID if available
      });

      // Store the generated lesson plan in localStorage for the results page
      localStorage.setItem('generatedLessonPlan', JSON.stringify(lessonPlan));
      
      // Navigate to the results page
      toast.success('Lesson plan generated successfully!', { id: 'generating-lesson-plan' });
      navigate('/teacher/content/lesson-plans/results');
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast.error('Failed to generate lesson plan. Please try again later.', { id: 'generating-lesson-plan' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Generate Lesson Plans
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create comprehensive lesson plans tailored to your teaching needs
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
          />

          <LessonPlanOptions
            format={format}
            setFormat={setFormat}
            numberOfClasses={numberOfClasses}
            setNumberOfClasses={setNumberOfClasses}
            learningObjectives={learningObjectives}
            setLearningObjectives={setLearningObjectives}
            requiredResources={requiredResources}
            setRequiredResources={setRequiredResources}
            isDarkMode={isDarkMode}
          />

          <ConfigurationSummary
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            selectedChapters={selectedChapters}
            format={format}
            numberOfClasses={numberOfClasses}
            isDarkMode={isDarkMode}
          />

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!selectedClass || !selectedSubject || selectedChapters.length === 0 || isGenerating}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin mr-2 h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                'Generate Lesson Plan'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}