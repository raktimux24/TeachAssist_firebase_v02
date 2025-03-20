export interface ContentStats {
  notes: number;
  flashcards: number;
  questionSets: number;
  lessonPlans: number;
  presentations: number;
  lastUpdated: Date;
}

export interface ContentStatsUpdate {
  type: 'notes' | 'flashcards' | 'questionSets' | 'lessonPlans' | 'presentations';
  operation: 'increment' | 'decrement';
} 