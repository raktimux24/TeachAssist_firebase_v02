import React, { useState } from 'react';
import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flag, Clock } from 'lucide-react';
import QuizSidePanel from './QuizSidePanel';

interface QuizInterfaceProps {
  config: {
    class: string;
    subject: string;
    chapters: string[];
  };
}

// Mock questions for demonstration
const mockQuestions = [
  {
    id: 1,
    question: 'What is the capital of France?',
    options: ['Berlin', 'Paris', 'Rome', 'Madrid'],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
  },
  // Add more questions as needed
];

export default function QuizInterface({ config }: QuizInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const question = mockQuestions[currentQuestion];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Question {currentQuestion + 1}
                </h2>
                <button
                  onClick={() => toggleFlag(question.id)}
                  className={`p-2 rounded-full ${
                    flaggedQuestions.includes(question.id)
                      ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                  }`}
                >
                  <Flag className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                {question.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(question.id, index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                    answers[question.id] === index
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md ring-2 ring-primary-500 ring-opacity-50'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-500'
                  }`}
                >
                  <span className={`font-medium ${
                    answers[question.id] === index
                      ? 'text-primary-700 dark:text-primary-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setCurrentQuestion(prev => Math.min(mockQuestions.length - 1, prev + 1))}
                disabled={currentQuestion === mockQuestions.length - 1}
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <QuizSidePanel
        totalQuestions={mockQuestions.length}
        currentQuestion={currentQuestion}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        timeRemaining={timeRemaining}
        onQuestionSelect={setCurrentQuestion}
      />
    </div>
  );
}