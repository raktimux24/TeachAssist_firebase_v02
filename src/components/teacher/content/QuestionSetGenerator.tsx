import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicSettings from './question-sets/BasicSettings';
import QuestionTypeSelector from './question-sets/QuestionTypeSelector';
import ConfigurationSummary from './question-sets/ConfigurationSummary';

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

interface QuestionSetGeneratorProps {
  isDarkMode: boolean;
}

export default function QuestionSetGenerator({ isDarkMode }: QuestionSetGeneratorProps) {
  const navigate = useNavigate();
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

  const totalQuestions = Object.values(questionTypes).reduce((sum, count) => sum + count, 0);

  const handleGenerate = () => {
    // Log the configuration (you can replace this with actual API call later)
    console.log('Question set configuration:', {
      class: selectedClass,
      subject: selectedSubject,
      chapters: selectedChapters,
      difficulty,
      includeAnswers,
      questionTypes,
    });
    
    // Navigate to the results page
    navigate('/teacher/content/question-sets/results');
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
              disabled={!selectedClass || !selectedSubject || selectedChapters.length === 0 || totalQuestions === 0}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Question Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}