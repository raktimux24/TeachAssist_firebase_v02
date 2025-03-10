import React from 'react';
import { Brain } from 'lucide-react';

interface FlashcardType {
  id: string;
  label: string;
  description: string;
}

interface FlashcardTypeSelectorProps {
  flashcardTypes: FlashcardType[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export default function FlashcardTypeSelector({
  flashcardTypes,
  selectedType,
  onTypeChange,
}: FlashcardTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Flashcard Type
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {flashcardTypes.map((type) => (
          <label
            key={type.id}
            className={`
              flex flex-col p-4 border rounded-lg cursor-pointer transition-colors
              ${selectedType === type.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-500'
              }
            `}
          >
            <input
              type="radio"
              name="flashcardType"
              value={type.id}
              checked={selectedType === type.id}
              onChange={(e) => onTypeChange(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center mb-2">
              <Brain className={`h-5 w-5 mr-2 ${
                selectedType === type.id
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400'
              }`} />
              <span className={`font-medium ${
                selectedType === type.id
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {type.label}
              </span>
            </div>
            <p className={`text-sm ${
              selectedType === type.id
                ? 'text-primary-600 dark:text-primary-300'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {type.description}
            </p>
          </label>
        ))}
      </div>
    </div>
  );
}