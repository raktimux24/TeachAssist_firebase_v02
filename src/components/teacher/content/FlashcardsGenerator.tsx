import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicSettings from './flashcards/BasicSettings';
import FlashcardTypeSelector from './flashcards/FlashcardTypeSelector';
import AdvancedSettings from './flashcards/AdvancedSettings';
import ConfigurationSummary from './flashcards/ConfigurationSummary';

interface FlashcardsGeneratorProps {
  isDarkMode: boolean;
}

const classes = ['Class 10', 'Class 11', 'Class 12'];
const subjects = {
  'Class 10': ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
  'Class 11': ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
  'Class 12': ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
};
const chapters = {
  Mathematics: ['Algebra', 'Geometry', 'Calculus'],
  Physics: ['Mechanics', 'Thermodynamics', 'Optics'],
  Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
  Biology: ['Cell Biology', 'Genetics', 'Evolution'],
};

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

export default function FlashcardsGenerator({ isDarkMode }: FlashcardsGeneratorProps) {
  const navigate = useNavigate();
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

  const isSTEMSubject = ['Mathematics', 'Physics', 'Chemistry'].includes(selectedSubject);

  const handleGenerate = () => {
    // Log the configuration (you can replace this with actual API call later)
    console.log('Flashcards configuration:', {
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
    });
    
    // Navigate to the results page
    navigate('/teacher/content/flashcards/results');
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

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!selectedClass || !selectedSubject || selectedChapters.length === 0}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Flashcards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}