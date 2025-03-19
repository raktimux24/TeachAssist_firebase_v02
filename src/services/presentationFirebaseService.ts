import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Presentation } from './presentationService';

// Extended Presentation interface with Firebase-specific fields
export interface FirebasePresentation extends Presentation {
  firebaseId?: string;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Save a presentation to Firestore
 */
export const savePresentation = async (presentation: Presentation, userId: string): Promise<string> => {
  try {
    console.log('Saving presentation to Firestore:', presentation.title);
    
    // Create a Firestore-friendly version of the presentation
    const presentationData = {
      title: presentation.title,
      subject: presentation.subject,
      class: presentation.class,
      type: presentation.type,
      template: presentation.template,
      slides: presentation.slides,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add the document to Firestore
    const docRef = await addDoc(collection(db, 'presentations'), presentationData);
    console.log('Presentation saved with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving presentation to Firestore:', error);
    throw new Error('Failed to save presentation to Firestore');
  }
};

/**
 * Get a presentation by ID
 */
export const getPresentation = async (presentationId: string): Promise<FirebasePresentation | null> => {
  try {
    console.log('Fetching presentation with ID:', presentationId);
    
    const docRef = doc(db, 'presentations', presentationId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('No presentation found with ID:', presentationId);
      return null;
    }
    
    const data = docSnap.data();
    
    // Convert Firestore timestamp to Date
    const createdAt = data.createdAt?.toDate() || new Date();
    const updatedAt = data.updatedAt?.toDate();
    
    // Return the presentation with its ID
    return {
      ...data,
      createdAt,
      updatedAt,
      firebaseId: docSnap.id
    } as FirebasePresentation;
  } catch (error) {
    console.error('Error fetching presentation:', error);
    throw new Error('Failed to fetch presentation');
  }
};

/**
 * Get all presentations for a user
 */
export const getUserPresentations = async (userId: string): Promise<FirebasePresentation[]> => {
  try {
    console.log('Fetching presentations for user:', userId);
    
    const presentationsRef = collection(db, 'presentations');
    const q = query(presentationsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const presentations: FirebasePresentation[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert Firestore timestamp to Date
      const createdAt = data.createdAt?.toDate() || new Date();
      const updatedAt = data.updatedAt?.toDate();
      
      presentations.push({
        ...data,
        createdAt,
        updatedAt,
        firebaseId: doc.id
      } as FirebasePresentation);
    });
    
    console.log(`Found ${presentations.length} presentations for user ${userId}`);
    return presentations;
  } catch (error) {
    console.error('Error fetching user presentations:', error);
    throw new Error('Failed to fetch presentations');
  }
};

/**
 * Update an existing presentation
 */
export const updatePresentation = async (presentation: FirebasePresentation): Promise<void> => {
  try {
    if (!presentation.firebaseId) {
      throw new Error('Presentation ID is required for updates');
    }
    
    console.log('Updating presentation with ID:', presentation.firebaseId);
    
    // Reference to the specific document
    const docRef = doc(db, 'presentations', presentation.firebaseId);
    
    // Create a Firestore-friendly version of the presentation
    const updatedData = {
      title: presentation.title,
      subject: presentation.subject,
      class: presentation.class,
      type: presentation.type,
      template: presentation.template,
      slides: presentation.slides,
      updatedAt: serverTimestamp()
    };
    
    // Update the document
    await updateDoc(docRef, updatedData);
    console.log('Presentation updated successfully');
  } catch (error) {
    console.error('Error updating presentation:', error);
    throw new Error('Failed to update presentation');
  }
};

/**
 * Delete a presentation
 */
export const deletePresentation = async (presentationId: string): Promise<void> => {
  try {
    console.log('Deleting presentation with ID:', presentationId);
    
    const docRef = doc(db, 'presentations', presentationId);
    await deleteDoc(docRef);
    
    console.log('Presentation deleted successfully');
  } catch (error) {
    console.error('Error deleting presentation:', error);
    throw new Error('Failed to delete presentation');
  }
};
