import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from './config';
import { FlashcardSet } from '../services/openai';
import { updateContentStats } from '../services/contentStatsService';

// Collection reference
const flashcardsCollection = collection(db, 'flashcards');

interface SaveFlashcardSetParams {
  userId?: string;
  generationOptions: Record<string, any>;
  createdAt: Date;
}

/**
 * Save a generated flashcard set to Firestore
 */
export const saveFlashcardSet = async (params: FlashcardSet & SaveFlashcardSetParams) => {
  try {
    console.log('Saving flashcard set with params:', params);
    
    if (!params.userId) {
      throw new Error('User ID is required to save flashcard set');
    }

    // Convert dates to Firestore timestamps
    const flashcardData = {
      ...params,
      createdAt: params.createdAt,
      updatedAt: new Date(),
      // Ensure all required fields are present
      title: params.title || `${params.subject} Flashcards`,
      class: params.class,
      subject: params.subject,
      book: params.book,
      chapters: params.chapters,
      flashcards: params.flashcards.map(card => ({
        ...card,
        id: card.id || `card-${Math.random().toString(36).substr(2, 9)}`
      })),
      generationOptions: {
        ...params.generationOptions,
        timestamp: new Date()
      }
    };
    
    console.log('Processed flashcard data:', flashcardData);
    
    const docRef = await addDoc(flashcardsCollection, flashcardData);
    console.log('Successfully saved flashcard set with ID:', docRef.id);
    
    // Update content stats
    await updateContentStats(params.userId, {
      type: 'flashcards',
      operation: 'increment'
    });
    
    return { id: docRef.id, ...flashcardData };
  } catch (error) {
    console.error('Error saving flashcard set:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

/**
 * Get all flashcard sets for a specific user
 */
export const getUserFlashcardSets = async (userId: string) => {
  try {
    const q = query(
      flashcardsCollection, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user flashcard sets:', error);
    throw error;
  }
};

/**
 * Get a specific flashcard set by ID
 */
export const getFlashcardSet = async (flashcardId: string) => {
  try {
    const docRef = doc(flashcardsCollection, flashcardId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Flashcard set not found');
    }
  } catch (error) {
    console.error('Error getting flashcard set:', error);
    throw error;
  }
};

/**
 * Update an existing flashcard set
 */
export const updateFlashcardSet = async (
  flashcardId: string,
  updates: Partial<FlashcardSet>
) => {
  try {
    const docRef = doc(flashcardsCollection, flashcardId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    return { id: flashcardId, ...updates };
  } catch (error) {
    console.error('Error updating flashcard set:', error);
    throw error;
  }
};

/**
 * Delete a flashcard set
 */
export const deleteFlashcardSet = async (flashcardId: string) => {
  try {
    // Get the flashcard set first to get the userId
    const docRef = doc(flashcardsCollection, flashcardId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Flashcard set not found');
    }
    
    const flashcardData = docSnap.data();
    
    // Delete the document
    await deleteDoc(docRef);
    
    // Update content stats if userId exists
    if (flashcardData.userId) {
      await updateContentStats(flashcardData.userId, {
        type: 'flashcards',
        operation: 'decrement'
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting flashcard set:', error);
    throw error;
  }
};

/**
 * Get recent flashcard sets for a user
 */
export const getRecentFlashcardSets = async (userId: string, limitCount = 5) => {
  try {
    const q = query(
      flashcardsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting recent flashcard sets:', error);
    throw error;
  }
};

/**
 * Get flashcard sets by subject
 */
export const getFlashcardSetsBySubject = async (userId: string, subject: string) => {
  try {
    const q = query(
      flashcardsCollection,
      where('userId', '==', userId),
      where('subject', '==', subject),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting flashcard sets by subject:', error);
    throw error;
  }
};

/**
 * Get flashcard sets by class
 */
export const getFlashcardSetsByClass = async (userId: string, className: string) => {
  try {
    const q = query(
      flashcardsCollection,
      where('userId', '==', userId),
      where('class', '==', className),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting flashcard sets by class:', error);
    throw error;
  }
};
