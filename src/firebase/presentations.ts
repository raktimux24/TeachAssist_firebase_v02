import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from './config';
import { Presentation } from '../services/presentationService';
import { updateContentStats } from '../services/contentStatsService';

// Collection reference
const presentationsCollection = collection(db, 'presentations');

/**
 * Save a generated presentation to Firestore
 * Checks for duplicates before saving to prevent multiple entries
 */
export const savePresentation = async (
  presentation: Presentation,
  userId: string,
  generationOptions: Record<string, any>
) => {
  try {
    // Check for potential duplicates first
    // We'll consider a presentation a duplicate if it has the same title, subject, class, book, and was created in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Query to find potential duplicates
    // Note: Firestore only allows inequality filters (<, <=, >, >=) on a single field
    // So we'll use only equality operators in the query and filter the rest in memory
    const q = query(
      presentationsCollection,
      where('userId', '==', userId),
      where('title', '==', presentation.title)
      // We'll check the other conditions after fetching the results
    );
    
    const querySnapshot = await getDocs(q);
    
    // Check if we have any potential duplicates
    if (!querySnapshot.empty) {
      console.log(`Found ${querySnapshot.size} potential duplicate(s) with same title`);
      
      // Filter results in memory for the remaining conditions
      const recentDuplicates = querySnapshot.docs.filter(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
        
        return (
          data.subject === presentation.subject &&
          data.class === presentation.class &&
          data.book === presentation.book &&
          createdAt >= fiveMinutesAgo
        );
      });
      
      console.log(`Found ${recentDuplicates.length} recent duplicates with matching details`);
      
      // Check if any of the filtered duplicates also match the chapters
      for (const doc of recentDuplicates) {
        const existingPresentation = doc.data();
        
        // Check if chapters match (assuming they're arrays)
        const existingChapters = existingPresentation.chapters || [];
        const newChapters = presentation.chapters || [];
        
        // Simple check: same number of chapters and all chapters match
        if (existingChapters.length === newChapters.length && 
            existingChapters.every((ch: string) => newChapters.includes(ch))) {
          console.log('Found exact duplicate, returning existing presentation');
          return { id: doc.id, ...existingPresentation };
        }
      }
    }
    
    // If no duplicates found, save the new presentation
    console.log('No duplicates found, saving new presentation');
    const presentationData = {
      ...presentation,
      userId,
      generationOptions,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(presentationsCollection, presentationData);
    
    // Update content stats to increment the presentations count
    try {
      console.log('Updating content stats for user:', userId);
      const creationDate = new Date(); // Use the current date for the stats
      await updateContentStats(userId, {
        type: 'presentations',
        operation: 'increment'
      }, creationDate);
      console.log('Content stats updated successfully');
    } catch (statsError) {
      console.error('Error updating content stats:', statsError);
      // Don't throw here, we still want to return the presentation data even if stats update fails
    }
    
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
  updates: Partial<Presentation>,
  isNewPresentation: boolean = false // Flag to indicate if this is a new presentation being updated
) => {
  try {
    const docRef = doc(presentationsCollection, presentationId);
    
    // Check if the document exists first
    const docSnap = await getDoc(docRef);
    const exists = docSnap.exists();
    // Use type assertion to access userId
    const userId = (updates as any).userId || (exists ? docSnap.data().userId : null);
    
    // If it's a new presentation and doesn't exist yet, we need to increment content stats
    const shouldUpdateStats = isNewPresentation && !exists && userId;
    
    // Update the document
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    // Update content stats if needed
    if (shouldUpdateStats) {
      try {
        console.log('Updating content stats for user:', userId);
        await updateContentStats(userId, {
          type: 'presentations',
          operation: 'increment'
        });
        console.log('Content stats updated successfully');
      } catch (statsError) {
        console.error('Error updating content stats:', statsError);
        // Don't throw here, we still want to return the presentation data even if stats update fails
      }
    }
    
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
    
    // First get the presentation to get the userId
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.warn('Presentation not found for deletion:', presentationId);
      return false;
    }
    
    const presentationData = docSnap.data();
    const userId = presentationData.userId;
    
    // Delete the presentation
    await deleteDoc(docRef);
    
    // Update content stats to decrement the presentations count
    if (userId) {
      try {
        console.log('Updating content stats for user:', userId);
        const deletionDate = new Date(); // Use the current date for the stats
        await updateContentStats(userId, {
          type: 'presentations',
          operation: 'decrement'
        }, deletionDate);
        console.log('Content stats updated successfully after deletion');
      } catch (statsError) {
        console.error('Error updating content stats after deletion:', statsError);
        // Don't throw here, we still want to return success even if stats update fails
      }
    } else {
      console.warn('No userId found for presentation, cannot update content stats');
    }
    
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
