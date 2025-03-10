import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Question {
  id: number;
  type: string;
  text: string;
  options?: string[];
  answer?: string;
  marks: number;
}

const mockQuestions: Question[] = [
  {
    id: 1,
    type: 'mcq',
    text: 'What is the capital of France?',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    answer: 'Paris',
    marks: 1,
  },
  {
    id: 2,
    type: 'true-false',
    text: 'The Earth revolves around the Sun.',
    options: ['True', 'False'],
    answer: 'True',
    marks: 1,
  },
  {
    id: 3,
    type: 'short-answer',
    text: 'Explain the process of photosynthesis in brief.',
    answer: 'Photosynthesis is the process by which plants convert light energy into chemical energy...',
    marks: 3,
  },
];

export default function QuestionSetPreview() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      {/* Question Set Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Class 10 - Physics
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-1" />
            Generated Successfully
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div>
            <span className="font-medium">Total Questions:</span> {mockQuestions.length}
          </div>
          <div>
            <span className="font-medium">Total Marks:</span> {mockQuestions.reduce((sum, q) => sum + q.marks, 0)}
          </div>
          <div>
            <span className="font-medium">Difficulty:</span> Medium
          </div>
          <div>
            <span className="font-medium">Time:</span> 45 minutes
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="p-6">
        <div className="space-y-6">
          {mockQuestions.map((question, index) => (
            <div
              key={question.id}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Question {index + 1}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({question.marks} {question.marks === 1 ? 'mark' : 'marks'})
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                      {question.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-white">
                    {question.text}
                  </p>
                </div>
              </div>

              {question.options && (
                <div className="ml-4 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center gap-2"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {question.answer && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Answer:
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {question.answer}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}