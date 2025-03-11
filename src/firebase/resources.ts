import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, getDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';
import { Resource } from '../types/resource';

// Upload a file to Firebase Storage
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
) => {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

// Create a new resource document in Firestore
export const createResource = async (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'resources'), {
      ...resource,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};

// Update a resource document in Firestore
export const updateResource = async (id: string, updates: Partial<Resource>) => {
  try {
    const docRef = doc(db, 'resources', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    throw error;
  }
};

// Delete a resource and its associated file
export const deleteResource = async (id: string, fileUrl: string) => {
  try {
    // Delete the file from Storage
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);

    // Delete the document from Firestore
    await deleteDoc(doc(db, 'resources', id));
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
};

// Get a resource by ID
export const getResource = async (id: string): Promise<Resource | null> => {
  try {
    const docRef = doc(db, 'resources', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Resource;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting resource:', error);
    throw error;
  }
};

// Fetch resources with filtering options
export const fetchResources = async (filters: {
  searchQuery?: string;
  class?: string;
  subject?: string;
  book?: string;
  chapter?: string;
}) => {
  try {
    let q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
    
    // Apply filters
    if (filters.class && filters.class !== 'all') {
      q = query(q, where('class', '==', filters.class));
    }
    
    if (filters.subject && filters.subject !== 'all') {
      q = query(q, where('subject', '==', filters.subject));
    }
    
    if (filters.book && filters.book !== 'all') {
      q = query(q, where('book', '==', filters.book));
    }
    
    if (filters.chapter && filters.chapter !== 'all') {
      q = query(q, where('chapter', '==', filters.chapter));
    }

    const querySnapshot = await getDocs(q);
    const resources: Resource[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Apply search filter if provided
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const titleMatch = data.title.toLowerCase().includes(searchLower);
        const descriptionMatch = data.description.toLowerCase().includes(searchLower);
        const tagsMatch = data.tags.some((tag: string) => tag.toLowerCase().includes(searchLower));
        
        if (!titleMatch && !descriptionMatch && !tagsMatch) {
          return;
        }
      }
      
      resources.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Resource);
    });

    return resources;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
}; 