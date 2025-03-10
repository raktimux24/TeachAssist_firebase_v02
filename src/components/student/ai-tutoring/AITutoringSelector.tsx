import React, { useState } from 'react';
import { Brain, Sparkles, BookOpen } from 'lucide-react';

interface AITutor {
  id: string;
  name: string;
  class: string;
  subject: string;
  description: string;
  features: string[];
}

const tutors: AITutor[] = [
  {
    id: '1',
    name: 'Math Mentor',
    class: 'Grade 10',
    subject: 'Mathematics',
    description: 'Specialized in algebra, geometry, and calculus with step-by-step problem solving',
    features: ['Interactive problem solving', 'Visual explanations', 'Practice exercises'],
  },
  {
    id: '2',
    name: 'Physics Pro',
    class: 'Grade 10',
    subject: 'Physics',
    description: 'Expert in mechanics, thermodynamics, and wave motion with real-world examples',
    features: ['Experiment simulations', 'Formula guidance', 'Conceptual explanations'],
  },
  {
    id: '3',
    name: 'Chemistry Guide',
    class: 'Grade 11',
    subject: 'Chemistry',
    description: 'Focuses on organic chemistry, chemical bonding, and reactions',
    features: ['Molecular visualization', 'Reaction pathways', 'Practice problems'],
  },
  {
    id: '4',
    name: 'Biology Buddy',
    class: 'Grade 11',
    subject: 'Biology',
    description: 'Covers cell biology, genetics, and human physiology with detailed diagrams',
    features: ['3D cell models', 'Genetic problem solving', 'Case studies'],
  },
];

const classes = ['All Classes', 'Grade 10', 'Grade 11', 'Grade 12'];

export default function AITutoringSelector() {
  const [selectedClass, setSelectedClass] = useState('All Classes');

  const filteredTutors = tutors.filter(tutor => 
    selectedClass === 'All Classes' || tutor.class === selectedClass
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            AI Tutoring Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select your personalized AI tutor for interactive learning
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {classes.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutors.map((tutor) => (
          <div
            key={tutor.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {tutor.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tutor.class} • {tutor.subject}
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {tutor.description}
              </p>

              <div className="space-y-2">
                {tutor.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Sparkles className="h-4 w-4 text-primary-500 mr-2" />
                    {feature}
                  </div>
                ))}
              </div>

              <button
                className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Start Learning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}