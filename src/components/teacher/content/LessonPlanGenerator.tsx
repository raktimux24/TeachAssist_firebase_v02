import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicSettings from './lesson-plans/BasicSettings';
import LessonPlanOptions from './lesson-plans/LessonPlanOptions';
import ConfigurationSummary from './lesson-plans/ConfigurationSummary';

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

export default function LessonPlanGenerator() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [format, setFormat] = useState<'general' | 'subject-specific'>('general');
  const [numberOfClasses, setNumberOfClasses] = useState(1);
  const [learningObjectives, setLearningObjectives] = useState('');
  const [requiredResources, setRequiredResources] = useState('');

  const handleGenerate = () => {
    // Log the configuration (you can replace this with actual API call later)
    console.log('Lesson plan configuration:', {
      class: selectedClass,
      subject: selectedSubject,
      chapters: selectedChapters,
      format,
      numberOfClasses,
      learningObjectives,
      requiredResources,
    });
    
    // Navigate to the results page
    navigate('/teacher/content/lesson-plans/results');
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
          />

          <ConfigurationSummary
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            selectedChapters={selectedChapters}
            format={format}
            numberOfClasses={numberOfClasses}
          />

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!selectedClass || !selectedSubject || selectedChapters.length === 0}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Lesson Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}