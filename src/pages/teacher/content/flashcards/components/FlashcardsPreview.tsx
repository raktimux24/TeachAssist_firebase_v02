import React, { useState } from 'react';
import { CheckCircle, BookOpen, Layout, Grid, ChevronLeft, ChevronRight } from 'lucide-react';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  type: 'definition' | 'concept' | 'formula' | 'question';
}

const mockFlashcards = {
  title: 'Chemical Bonding',
  subject: 'Chemistry',
  class: 'Class 11',
  type: 'Concept-based',
  cards: [
    {
      id: 1,
      front: 'What is a Chemical Bond?',
      back: 'A chemical bond is the force of attraction that holds atoms together in a molecule or compound.',
      type: 'definition'
    },
    {
      id: 2,
      front: 'Types of Chemical Bonds',
      back: '1. Ionic Bond\n2. Covalent Bond\n3. Metallic Bond',
      type: 'concept'
    },
    {
      id: 3,
      front: 'Bond Energy Formula',
      back: 'Bond Energy = Energy required to break one mole of bonds in gaseous molecules',
      type: 'formula'
    },
    {
      id: 4,
      front: 'Why do atoms form chemical bonds?',
      back: 'Atoms form chemical bonds to achieve a more stable electron configuration, typically by reaching the electron configuration of the nearest noble gas.',
      type: 'question'
    }
  ]
};

export default function FlashcardsPreview() {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  const nextCard = () => {
    setCurrentCard(prev => Math.min(prev + 1, mockFlashcards.cards.length - 1));
    setIsFlipped(false);
  };

  const previousCard = () => {
    setCurrentCard(prev => Math.max(prev - 1, 0));
    setIsFlipped(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mockFlashcards.title}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode(prev => prev === 'single' ? 'grid' : 'single')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Grid className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-1" />
              Generated Successfully
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>{mockFlashcards.subject} - {mockFlashcards.class}</span>
          </div>
          <div className="flex items-center">
            <Layout className="w-4 h-4 mr-2" />
            <span>{mockFlashcards.type}</span>
          </div>
          <div className="flex items-center">
            <Layout className="w-4 h-4 mr-2" />
            <span>{mockFlashcards.cards.length} Cards</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'single' ? (
          <div className="space-y-6">
            {/* Flashcard View */}
            <div 
              className="max-w-2xl mx-auto aspect-[3/2] cursor-pointer perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className={`absolute inset-0 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8 backface-hidden ${isFlipped ? 'invisible' : ''}`}>
                  <div className="flex flex-col items-center justify-center h-full">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white text-center">
                      {mockFlashcards.cards[currentCard].front}
                    </h3>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Click to flip
                    </p>
                  </div>
                </div>

                {/* Back */}
                <div className={`absolute inset-0 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8 backface-hidden rotate-y-180 ${!isFlipped ? 'invisible' : ''}`}>
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-lg text-gray-700 dark:text-gray-300 text-center whitespace-pre-line">
                      {mockFlashcards.cards[currentCard].back}
                    </p>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Click to flip back
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={previousCard}
                disabled={currentCard === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Previous
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Card {currentCard + 1} of {mockFlashcards.cards.length}
              </span>
              <button
                onClick={nextCard}
                disabled={currentCard === mockFlashcards.cards.length - 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockFlashcards.cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => {
                  setCurrentCard(index);
                  setViewMode('single');
                  setIsFlipped(false);
                }}
                className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Card {index + 1}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {card.type}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {card.front}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}