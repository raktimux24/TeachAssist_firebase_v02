// Define types for flashcard data structures

/**
 * Type definition for card items that might be in the Firebase data
 */
export type CardItem = {
  id?: string;
  front: string;
  back: string;
  type?: string;
};

/**
 * Type definition for Firebase flashcard set data structure
 * This represents how flashcard data is stored in Firebase
 */
export interface FirebaseFlashcardSet {
  id: string; 
  userId: string; 
  createdAt: any; 
  updatedAt: any; 
  generationOptions?: any;
  title: string;
  subject: string;
  class: string;
  book: string | null | undefined;
  chapters: string[] | null | undefined;
  // Firebase might store the data either as 'cards' or 'flashcards'
  cards?: CardItem[];
  flashcards?: CardItem[];
}
