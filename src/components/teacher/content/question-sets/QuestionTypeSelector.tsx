import React from 'react';
import { Settings } from 'lucide-react';

interface QuestionType {
  id: string;
  label: string;
  min: number;
  max: number;
}

interface QuestionTypeSelectorProps {
  questionTypes: Record<string, number>;
  setQuestionTypes: (types: Record<string, number>) => void;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  includeAnswers: boolean;
  setIncludeAnswers: (include: boolean) => void;
}

const questionTypesList: QuestionType[] = [
  { id: 'mcq', label: 'MCQ', min: 0, max: 50 },
  { id: 'true-false', label: 'True/False', min: 0, max: 50 },
  { id: 'short-answers', label: 'Short Answers', min: 0, max: 50 },
  { id: 'long-answers', label: 'Long Answers', min: 0, max: 50 },
  { id: 'fill-in-blanks', label: 'Fill in the Blanks', min: 0, max: 50 },
  { id: 'passage-based', label: 'Passage Based', min: 0, max: 50 },
  { id: 'extract-based', label: 'Extract Based', min: 0, max: 50 },
];

export default function QuestionTypeSelector({
  questionTypes,
  setQuestionTypes,
  difficulty,
  setDifficulty,
  includeAnswers,
  setIncludeAnswers,
}: QuestionTypeSelectorProps) {
  const totalQuestions = Object.values(questionTypes).reduce((sum, count) => sum + count, 0);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center mb-4">
        <Settings className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Question Types
        </h3>
      </div>

      <div className="space-y-6">
        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty Level
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Question Types */}
        <div className="space-y-4">
          {questionTypesList.map((type) => (
            <div key={type.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">{type.label}</span>
              <input
                type="number"
                min={type.min}
                max={type.max}
                value={questionTypes[type.id]}
                onChange={(e) => {
                  const value = Math.max(type.min, Math.min(type.max, parseInt(e.target.value) || 0));
                  setQuestionTypes({
                    ...questionTypes,
                    [type.id]: value
                  });
                }}
                className="w-24 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
        </div>

        {/* Total Questions Display */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Questions
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {totalQuestions}
          </span>
        </div>

        {/* Include Answers Toggle */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeAnswers}
              onChange={(e) => setIncludeAnswers(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include Answers</span>
          </label>
        </div>
      </div>
    </div>
  );
}