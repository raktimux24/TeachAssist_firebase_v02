import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from './config';
import { FlashcardSet } from '../services/openai';

// Collection reference
const flashcardsCollection = collection(db, 'flashcards');

/**
 * Save a generated flashcard set to Firestore
 */
export const saveFlashcardSet = async (
  flashcardSet: FlashcardSet,
  userId: string,
  generationOptions: Record<string, any>
) => {
  try {
    // Add timestamp and user information
    const flashcardData = {
      ...flashcardSet,
      userId,
      generationOptions,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(flashcardsCollection, flashcardData);
    return { id: docRef.id, ...flashcardData };
  } catch (error) {
    console.error('Error saving flashcard set:', error);
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
    const docRef = doc(flashcardsCollection, flashcardId);
    await deleteDoc(docRef);
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
