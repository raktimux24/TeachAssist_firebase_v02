import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicSettings from './presentations/BasicSettings';
import PresentationTypeSelector from './presentations/PresentationTypeSelector';
import AdvancedSettings from './presentations/AdvancedSettings';
import ConfigurationSummary from './presentations/ConfigurationSummary';

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

export default function PresentationsGenerator() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [presentationType, setPresentationType] = useState('slide-by-slide');
  const [slideCount, setSlideCount] = useState(20);
  const [designTemplate, setDesignTemplate] = useState('modern');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const handleGenerate = () => {
    // Log the configuration (you can replace this with actual API call later)
    console.log('Presentation configuration:', {
      class: selectedClass,
      subject: selectedSubject,
      chapters: selectedChapters,
      presentationType,
      slideCount,
      designTemplate,
      additionalInstructions,
    });
    
    // Navigate to the results page
    navigate('/teacher/content/presentations/results');
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
            selectedChapters={selectedChapters}
            setSelectedChapters={setSelectedChapters}
            classes={classes}
            subjects={subjects}
            chapters={chapters}
          />

          <PresentationTypeSelector
            presentationTypes={presentationTypes}
            selectedType={presentationType}
            onTypeChange={setPresentationType}
          />

          <AdvancedSettings
            slideCount={slideCount}
            setSlideCount={setSlideCount}
            designTemplate={designTemplate}
            setDesignTemplate={setDesignTemplate}
            additionalInstructions={additionalInstructions}
            setAdditionalInstructions={setAdditionalInstructions}
          />

          <ConfigurationSummary
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            selectedChapters={selectedChapters}
            presentationType={presentationType}
            slideCount={slideCount}
            designTemplate={designTemplate}
          />

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!selectedClass || !selectedSubject || selectedChapters.length === 0}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Presentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}