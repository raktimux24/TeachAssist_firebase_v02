import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicSettings from './notes/BasicSettings';
import NoteTypeSelector from './notes/NoteTypeSelector';
import AdvancedSettings from './notes/AdvancedSettings';
import ConfigurationSummary from './notes/ConfigurationSummary';
import { fetchClasses, fetchSubjects, fetchBooks, fetchChapters, fetchResourcesByChapters } from '../../../firebase/resources';
import { generateNotes } from '../../../services/notesGeneration';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';

interface NotesGeneratorProps {
  isDarkMode: boolean;
}

const noteTypes = [
  { id: 'bullet-points', label: 'Bullet Points' },
  { id: 'outline', label: 'Outline Method' },
  { id: 'detailed', label: 'Detailed Notes' },
  { id: 'important-qa', label: 'Important Questions & Definitions' },
  { id: 'theorems-formulas', label: 'Theorems & Formulas' },
];

export default function NotesGenerator({ isDarkMode }: NotesGeneratorProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [noteType, setNoteType] = useState('bullet-points');
  const [layout, setLayout] = useState<'one-column' | 'two-column'>('one-column');
  const [includeDefinitions, setIncludeDefinitions] = useState(true);
  const [includeTheorems, setIncludeTheorems] = useState(true);
  const [includeFormulas, setIncludeFormulas] = useState(true);
  const [includeKeyPoints, setIncludeKeyPoints] = useState(true);
  const [includeSummaries, setIncludeSummaries] = useState(true);
  const [includeDiscussionQuestions, setIncludeDiscussionQuestions] = useState(true);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for storing data from Firebase
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string[]>>({});
  const [books, setBooks] = useState<Record<string, string[]>>({});
  const [chapters, setChapters] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState({
    classes: false,
    subjects: false,
    books: false,
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

  // Fetch books when a subject is selected
  useEffect(() => {
    if (!selectedClass || !selectedSubject) return;

    const getBooks = async () => {
      setLoading(prev => ({ ...prev, books: true }));
      try {
        const fetchedBooks = await fetchBooks(selectedClass, selectedSubject);
        setBooks(prev => ({
          ...prev,
          [selectedSubject]: fetchedBooks
        }));
      } catch (error) {
        console.error('Error fetching books:', error);
        toast.error('Failed to load books. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, books: false }));
      }
    };

    getBooks();
  }, [selectedClass, selectedSubject]);

  // Fetch chapters when a book is selected
  useEffect(() => {
    if (!selectedClass || !selectedSubject || !selectedBook) return;

    const getChapters = async () => {
      setLoading(prev => ({ ...prev, chapters: true }));
      try {
        const fetchedChapters = await fetchChapters(selectedClass, selectedSubject, selectedBook);
        setChapters(prev => ({
          ...prev,
          [selectedBook]: fetchedChapters
        }));
      } catch (error) {
        console.error('Error fetching chapters:', error);
        toast.error('Failed to load chapters. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, chapters: false }));
      }
    };

    getChapters();
  }, [selectedClass, selectedSubject, selectedBook]);

  const isSTEMSubject = ['Mathematics', 'Physics', 'Chemistry'].includes(selectedSubject);

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || !selectedBook || selectedChapters.length === 0) {
      toast.error('Please select a class, subject, book, and at least one chapter');
      return;
    }

    setIsGenerating(true);
    toast.loading('Generating notes...', { id: 'generating-notes' });

    try {
      // Fetch resources for the selected chapters
      const resources = await fetchResourcesByChapters(selectedClass, selectedSubject, selectedChapters, selectedBook);

      if (resources.length === 0) {
        toast.error('No resources found for the selected chapters. Please select different chapters or contact your administrator.');
        setIsGenerating(false);
        return;
      }

      // Generate notes
      const notesSet = await generateNotes({
        title: `${selectedSubject} Notes: ${selectedChapters.join(', ')}`,
        class: selectedClass,
        subject: selectedSubject,
        book: selectedBook,
        chapters: selectedChapters,
        noteType: noteType,
        layout,
        includeDefinitions,
        includeTheorems,
        includeFormulas,
        includeKeyPoints,
        includeSummaries,
        includeDiscussionQuestions,
        additionalInstructions,
        resources,
        userId: currentUser?.uid // Pass the user ID if available
      });

      // Store the generated notes in localStorage for the results page
      localStorage.setItem('generatedNotes', JSON.stringify(notesSet));

      // Navigate to the results page
      toast.success('Notes generated successfully!', { id: 'generating-notes' });
      navigate('/teacher/content/notes/results');
    } catch (error) {
      console.error('Error generating notes:', error);
      toast.error('Failed to generate notes. Please try again later.', { id: 'generating-notes' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${isDarkMode ? 'dark' : ''}`}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Generate Notes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create comprehensive class notes with customized content and formatting
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
          />

          <NoteTypeSelector
            noteTypes={noteTypes}
            selectedType={noteType}
            onTypeChange={setNoteType}
          />

          <AdvancedSettings
            layout={layout}
            setLayout={setLayout}
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
            noteType={noteType}
            layout={layout}
          />

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!selectedClass || !selectedSubject || selectedChapters.length === 0 || isGenerating}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}