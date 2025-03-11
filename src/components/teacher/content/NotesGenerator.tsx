import { useState } from 'react';
import BasicSettings from './notes/BasicSettings';
import NoteTypeSelector from './notes/NoteTypeSelector';
import AdvancedSettings from './notes/AdvancedSettings';
import ConfigurationSummary from './notes/ConfigurationSummary';

interface NotesGeneratorProps {
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

const noteTypes = [
  { id: 'bullet-points', label: 'Bullet Points' },
  { id: 'outline', label: 'Outline Method' },
  { id: 'detailed', label: 'Detailed Notes' },
  { id: 'important-qa', label: 'Important Questions & Definitions' },
  { id: 'theorems-formulas', label: 'Theorems & Formulas' },
];

export default function NotesGenerator({ isDarkMode }: NotesGeneratorProps) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
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

  const isSTEMSubject = ['Mathematics', 'Physics', 'Chemistry'].includes(selectedSubject);

  const handleGenerate = () => {
    // Log the configuration (you can replace this with actual API call later)
    console.log('Notes configuration:', {
      class: selectedClass,
      subject: selectedSubject,
      chapters: selectedChapters,
      noteType,
      layout,
      includeDefinitions,
      includeTheorems,
      includeFormulas,
      includeKeyPoints,
      includeSummaries,
      includeDiscussionQuestions,
      additionalInstructions,
    });
    
    // Navigate to the results page
    window.location.href = '/teacher/content/notes/results';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
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
            selectedChapters={selectedChapters}
            setSelectedChapters={setSelectedChapters}
            classes={classes}
            subjects={subjects}
            chapters={chapters}
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
              disabled={!selectedClass || !selectedSubject || selectedChapters.length === 0}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}