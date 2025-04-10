export interface DailyContentStat {
  date: Date;           // The date for these stats
  userId: string;       // User who created the content
  lessonPlans: number;  // Count of lesson plans created on this date
  questionSets: number; // Count of question sets created on this date
  presentations: number; // Count of presentations created on this date
  notes: number;        // Count of notes created on this date
  flashcards: number;   // Count of flashcard sets created on this date
}

export interface ContentGenerationData {
  date: Date;           // The actual date object
  name?: string;        // Date string for display (e.g., "21 Mar")
  notes: number;        // Count of notes created on this date
  flashcards: number;   // Count of flashcard sets created on this date
  questionSets: number; // Count of question sets created on this date
  lessonPlans: number;  // Count of lesson plans created on this date
  presentations: number; // Count of presentations created on this date
  
  // For backward compatibility with existing chart implementation
  'Lesson Plans'?: number;
  'Question Sets'?: number;
  'Presentations'?: number;
  'Class Notes'?: number;
  'Flash Cards'?: number;
}

export type TimeRange = 30 | 60 | 90;
