import React from 'react';
import { Award, Clock, CheckCircle, XCircle } from 'lucide-react';

const mockResults = {
  score: 85,
  totalQuestions: 20,
  correctAnswers: 17,
  incorrectAnswers: 3,
  timeTaken: '15:30',
  accuracy: 85,
};

export default function QuizResultsSummary() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Quiz Results
        </h2>

        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <svg className="w-32 h-32">
              <circle
                className="text-gray-200 dark:text-gray-700"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
              <circle
                className="text-primary-600 dark:text-primary-400"
                strokeWidth="8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - mockResults.score / 100)}`}
                transform="rotate(-90 64 64)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {mockResults.score}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Correct</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockResults.correctAnswers}
            </span>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Incorrect</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockResults.incorrectAnswers}
            </span>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-primary-500 mr-2" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Time</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockResults.timeTaken}
            </span>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              <Award className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Accuracy</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockResults.accuracy}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}