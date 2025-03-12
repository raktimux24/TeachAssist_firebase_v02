import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from './config';
import { Presentation } from '../services/presentationService';

// Collection reference
const presentationsCollection = collection(db, 'presentations');

/**
 * Save a generated presentation to Firestore
 */
export const savePresentation = async (
  presentation: Presentation,
  userId: string,
  generationOptions: Record<string, any>
) => {
  try {
    // Add timestamp and user information
    const presentationData = {
      ...presentation,
      userId,
      generationOptions,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(presentationsCollection, presentationData);
    return { id: docRef.id, ...presentationData };
  } catch (error) {
    console.error('Error saving presentation:', error);
    throw error;
  }
};

/**
 * Get all presentations for a specific user
 */
export const getUserPresentations = async (userId: string) => {
  try {
    const q = query(
      presentationsCollection, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user presentations:', error);
    throw error;
  }
};

/**
 * Get a specific presentation by ID
 */
export const getPresentation = async (presentationId: string) => {
  try {
    const docRef = doc(presentationsCollection, presentationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Presentation not found');
    }
  } catch (error) {
    console.error('Error getting presentation:', error);
    throw error;
  }
};

/**
 * Update an existing presentation
 */
export const updatePresentation = async (
  presentationId: string,
  updates: Partial<Presentation>
) => {
  try {
    const docRef = doc(presentationsCollection, presentationId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    return { id: presentationId, ...updates };
  } catch (error) {
    console.error('Error updating presentation:', error);
    throw error;
  }
};

/**
 * Delete a presentation
 */
export const deletePresentation = async (presentationId: string) => {
  try {
    const docRef = doc(presentationsCollection, presentationId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting presentation:', error);
    throw error;
  }
};

/**
 * Get recent presentations for a user
 */
export const getRecentPresentations = async (userId: string, limitCount = 5) => {
  try {
    const q = query(
      presentationsCollection,
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
    console.error('Error getting recent presentations:', error);
    throw error;
  }
};

/**
 * Get presentations by subject
 */
export const getPresentationsBySubject = async (userId: string, subject: string) => {
  try {
    const q = query(
      presentationsCollection,
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
    console.error('Error getting presentations by subject:', error);
    throw error;
  }
};

/**
 * Get presentations by class
 */
export const getPresentationsByClass = async (userId: string, className: string) => {
  try {
    const q = query(
      presentationsCollection,
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
    console.error('Error getting presentations by class:', error);
    throw error;
  }
};
