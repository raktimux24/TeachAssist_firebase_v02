import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const mockQuestions = [
  {
    id: 1,
    question: 'What is the capital of France?',
    selectedAnswer: 'Paris',
    correctAnswer: 'Paris',
    isCorrect: true,
    explanation: 'Paris is the capital and largest city of France.',
  },
  {
    id: 2,
    question: 'Which planet is known as the Red Planet?',
    selectedAnswer: 'Venus',
    correctAnswer: 'Mars',
    isCorrect: false,
    explanation: 'Mars appears red due to iron oxide (rust) on its surface.',
  },
];

export default function QuizResultsDetails() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Detailed Analysis
        </h3>

        <div className="space-y-6">
          {mockQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {question.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-gray-900 dark:text-white font-medium mb-2">
                    {question.question}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400 w-32">Your Answer:</span>
                      <span className={`font-medium ${
                        question.isCorrect
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {question.selectedAnswer}
                      </span>
                    </div>
                    
                    {!question.isCorrect && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 w-32">Correct Answer:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {question.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start text-sm text-gray-500 dark:text-gray-400">
                    <AlertCircle className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
                    <p>{question.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}