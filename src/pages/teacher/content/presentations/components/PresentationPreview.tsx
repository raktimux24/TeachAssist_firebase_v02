import React, { useState } from 'react';
import { CheckCircle, BookOpen, Layout, ChevronLeft, ChevronRight, Grid } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  content: string[];
  notes?: string;
}

const mockPresentation = {
  title: 'Introduction to Algebra',
  subject: 'Mathematics',
  class: 'Class 10',
  type: 'Topic Wise',
  template: 'Modern',
  slides: [
    {
      id: 1,
      title: 'What is Algebra?',
      content: [
        'Definition of Algebra',
        'Historical significance',
        'Real-world applications'
      ],
      notes: 'Start with engaging examples from daily life'
    },
    {
      id: 2,
      title: 'Basic Algebraic Concepts',
      content: [
        'Variables and Constants',
        'Expressions',
        'Equations'
      ],
      notes: 'Use visual representations for each concept'
    },
    {
      id: 3,
      title: 'Solving Simple Equations',
      content: [
        'Step-by-step process',
        'Example problems',
        'Practice exercises'
      ],
      notes: 'Include interactive examples on the board'
    }
  ]
};

export default function PresentationPreview() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'slide' | 'grid'>('slide');

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, mockPresentation.slides.length - 1));
  };

  const previousSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      {/* Presentation Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mockPresentation.title}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode(prev => prev === 'slide' ? 'grid' : 'slide')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Grid className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-1" />
              Generated Successfully
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>{mockPresentation.subject} - {mockPresentation.class}</span>
          </div>
          <div className="flex items-center">
            <Layout className="w-4 h-4 mr-2" />
            <span>{mockPresentation.type}</span>
          </div>
          <div className="flex items-center">
            <Layout className="w-4 h-4 mr-2" />
            <span>{mockPresentation.template} Template</span>
          </div>
        </div>
      </div>

      {/* Presentation Content */}
      <div className="p-6">
        {viewMode === 'slide' ? (
          <div className="space-y-6">
            {/* Slide View */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                  {mockPresentation.slides[currentSlide].title}
                </h3>
                <div className="space-y-4">
                  {mockPresentation.slides[currentSlide].content.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={previousSlide}
                disabled={currentSlide === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Previous
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Slide {currentSlide + 1} of {mockPresentation.slides.length}
              </span>
              <button
                onClick={nextSlide}
                disabled={currentSlide === mockPresentation.slides.length - 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>

            {/* Speaker Notes */}
            {mockPresentation.slides[currentSlide].notes && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Speaker Notes
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {mockPresentation.slides[currentSlide].notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mockPresentation.slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => {
                  setCurrentSlide(index);
                  setViewMode('slide');
                }}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 truncate">
                  {slide.title}
                </h4>
                <div className="space-y-1">
                  {slide.content.slice(0, 2).map((item, itemIndex) => (
                    <p
                      key={itemIndex}
                      className="text-xs text-gray-500 dark:text-gray-400 truncate"
                    >
                      • {item}
                    </p>
                  ))}
                  {slide.content.length > 2 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      + {slide.content.length - 2} more
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}