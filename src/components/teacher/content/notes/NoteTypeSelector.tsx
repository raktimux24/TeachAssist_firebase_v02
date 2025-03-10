import React from 'react';
import { FileText } from 'lucide-react';

interface NoteType {
  id: string;
  label: string;
}

interface NoteTypeSelectorProps {
  noteTypes: NoteType[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export default function NoteTypeSelector({
  noteTypes,
  selectedType,
  onTypeChange,
}: NoteTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Note Type
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {noteTypes.map((type) => (
          <label
            key={type.id}
            className={`
              flex items-center p-3 border rounded-lg cursor-pointer transition-colors
              ${selectedType === type.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-500'
              }
            `}
          >
            <input
              type="radio"
              name="noteType"
              value={type.id}
              checked={selectedType === type.id}
              onChange={(e) => onTypeChange(e.target.value)}
              className="sr-only"
            />
            <FileText className={`h-5 w-5 mr-2 ${
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
          </label>
        ))}
      </div>
    </div>
  );
}