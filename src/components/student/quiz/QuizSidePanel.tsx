import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, CheckCircle, HelpCircle, Clock } from 'lucide-react';

interface QuizSidePanelProps {
  totalQuestions: number;
  currentQuestion: number;
  answers: Record<number, number>;
  flaggedQuestions: number[];
  timeRemaining: number;
  onQuestionSelect: (index: number) => void;
}

export default function QuizSidePanel({
  totalQuestions,
  currentQuestion,
  answers,
  flaggedQuestions,
  timeRemaining,
  onQuestionSelect,
}: QuizSidePanelProps) {
  const navigate = useNavigate();
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.length;
  const remainingCount = totalQuestions - answeredCount;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
      {/* Timer */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Remaining</span>
          <Clock className={`h-5 w-5 ${timeRemaining < 300 ? 'text-red-500' : 'text-gray-400'}`} />
        </div>
        <div className={`text-2xl font-bold ${
          timeRemaining < 300 
            ? 'text-red-500 dark:text-red-400' 
            : 'text-gray-900 dark:text-white'
        }`}>
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Progress
        </h3>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="font-medium text-gray-900 dark:text-white">{answeredCount}</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">Answered</span>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Flag className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="font-medium text-gray-900 dark:text-white">{flaggedCount}</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">Flagged</span>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <HelpCircle className="h-4 w-4 text-gray-400 mr-1" />
              <span className="font-medium text-gray-900 dark:text-white">{remainingCount}</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">Remaining</span>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Questions
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <button
              key={i}
              onClick={() => onQuestionSelect(i)}
              className={`
                h-8 w-8 rounded flex items-center justify-center text-sm font-medium
                ${currentQuestion === i ? 'ring-2 ring-primary-500' : ''}
                ${answers[i] !== undefined
                  ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }
                ${flaggedQuestions.includes(i) ? 'ring-2 ring-yellow-500' : ''}
              `}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={() => navigate('/student/quiz-results')}
        className="w-full mt-8 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Submit Quiz
      </button>
    </div>
  );
}