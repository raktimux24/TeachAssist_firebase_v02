import React, { Dispatch, SetStateAction } from 'react';
import { Brain } from 'lucide-react';

interface FlashcardType {
  id: string;
  label: string;
  description: string;
  stemOnly?: boolean;
}

interface FlashcardTypeSelectorProps {
  selectedType: string;
  setSelectedType: Dispatch<SetStateAction<string>>;
  isSTEMSubject: boolean;
}

const flashcardTypes: FlashcardType[] = [
  {
    id: 'definition',
    label: 'Definition',
    description: 'Term on front, definition on back'
  },
  {
    id: 'concept',
    label: 'Concept',
    description: 'Concept name on front, explanation on back'
  },
  {
    id: 'example',
    label: 'Example',
    description: 'Problem on front, solution on back'
  },
  {
    id: 'formula',
    label: 'Formula',
    description: 'Formula name on front, formula and explanation on back',
    stemOnly: true
  }
];

export default function FlashcardTypeSelector({
  selectedType,
  setSelectedType,
  isSTEMSubject
}: FlashcardTypeSelectorProps) {
  const filteredTypes = isSTEMSubject
    ? flashcardTypes
    : flashcardTypes.filter(type => !type.stemOnly);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Flashcard Type
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filteredTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setSelectedType(type.id)}
            className={`relative rounded-lg border p-4 flex flex-col hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              selectedType === type.id
                ? 'border-primary-500 ring-2 ring-primary-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <span className="text-base font-medium text-gray-900 dark:text-white">
              {type.label}
            </span>
            <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {type.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}