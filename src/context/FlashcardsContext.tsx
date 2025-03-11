import { createContext, useContext, useState, ReactNode } from 'react';
import { FlashcardSet } from '../services/openai';

interface FlashcardsContextType {
  flashcardSet: FlashcardSet | null;
  setFlashcardSet: (flashcardSet: FlashcardSet | null) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const FlashcardsContext = createContext<FlashcardsContextType | undefined>(undefined);

export const useFlashcards = () => {
  const context = useContext(FlashcardsContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardsProvider');
  }
  return context;
};

interface FlashcardsProviderProps {
  children: ReactNode;
}

export const FlashcardsProvider = ({ children }: FlashcardsProviderProps) => {
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = {
    flashcardSet,
    setFlashcardSet,
    isGenerating,
    setIsGenerating,
    error,
    setError
  };

  return (
    <FlashcardsContext.Provider value={value}>
      {children}
    </FlashcardsContext.Provider>
  );
};
