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
    console.log('fetchResources: Starting with filters:', filters);
    let q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
    console.log('fetchResources: Initial query created with orderBy createdAt desc');
    
    // Apply filters
    if (filters.class && filters.class !== 'all') {
      console.log('fetchResources: Adding class filter:', filters.class);
      q = query(q, where('class', '==', filters.class));
    }
    
    if (filters.subject && filters.subject !== 'all') {
      console.log('fetchResources: Adding subject filter:', filters.subject);
      q = query(q, where('subject', '==', filters.subject));
    }
    
    if (filters.book && filters.book !== 'all') {
      console.log('fetchResources: Adding book filter:', filters.book);
      q = query(q, where('book', '==', filters.book));
    }
    
    if (filters.chapter && filters.chapter !== 'all') {
      console.log('fetchResources: Adding chapter filter:', filters.chapter);
      q = query(q, where('chapter', '==', filters.chapter));
    }

    console.log('fetchResources: Executing query to Firestore');
    const querySnapshot = await getDocs(q);
    console.log('fetchResources: Query completed, document count:', querySnapshot.size);
    
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
          console.log('fetchResources: Skipping document that does not match search query:', data.title);
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

    console.log('fetchResources: Final resources count:', resources.length);
    console.log('fetchResources: Resource uploadedBy values:', resources.map(r => r.uploadedBy));
    
    return resources;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
}; 

// Fetch chapters based on class, subject, and optionally book
export const fetchChapters = async (classId: string, subjectId: string, bookId?: string): Promise<string[]> => {
  try {
    console.log('fetchChapters: Starting with class:', classId, 'subject:', subjectId, bookId ? `book: ${bookId}` : '');
    
    if (classId === 'all' || subjectId === 'all') {
      console.log('fetchChapters: Class or subject is "all", returning empty array');
      return [];
    }
    
    // Query resources collection to get unique chapters for the given class, subject, and optionally book
    let q;
    
    if (bookId && bookId !== 'all') {
      q = query(
        collection(db, 'resources'),
        where('class', '==', classId),
        where('subject', '==', subjectId),
        where('book', '==', bookId)
      );
      console.log('fetchChapters: Querying with book filter:', bookId);
    } else {
      q = query(
        collection(db, 'resources'),
        where('class', '==', classId),
        where('subject', '==', subjectId)
      );
      console.log('fetchChapters: Querying without book filter');
    }
    
    console.log('fetchChapters: Executing query to Firestore');
    const querySnapshot = await getDocs(q);
    console.log('fetchChapters: Query completed, document count:', querySnapshot.size);
    
    // Extract unique chapters from the results
    const chaptersSet = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.chapter) {
        chaptersSet.add(data.chapter);
      }
    });
    
    const chapters = Array.from(chaptersSet).sort();
    console.log('fetchChapters: Found chapters:', chapters);
    
    return chapters;
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
};

// Fetch all available classes from resources collection
export const fetchClasses = async (): Promise<string[]> => {
  try {
    console.log('fetchClasses: Starting to fetch classes');
    
    // Query resources collection to get all documents
    const q = query(collection(db, 'resources'));
    
    console.log('fetchClasses: Executing query to Firestore');
    const querySnapshot = await getDocs(q);
    console.log('fetchClasses: Query completed, document count:', querySnapshot.size);
    
    // Extract unique classes from the results
    const classesSet = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.class) {
        classesSet.add(data.class);
      }
    });
    
    const classes = Array.from(classesSet).sort((a, b) => {
      // Handle both numeric and Roman numeral classes
      // Convert Roman numerals to numbers for comparison
      const romanToNum = (roman: string) => {
        if (roman === '7' || roman.toUpperCase() === 'VII') return 7;
        if (roman === '8' || roman.toUpperCase() === 'VIII') return 8;
        return parseInt(roman);
      };
      
      return romanToNum(a) - romanToNum(b);
    });
    
    console.log('fetchClasses: Found classes:', classes);
    
    return classes;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

// Fetch subjects based on class selection
export const fetchSubjects = async (classId: string): Promise<string[]> => {
  console.log('fetchSubjects: Starting with class:', classId);
  
  if (!classId) {
    console.warn('fetchSubjects: No class ID provided');
    return [];
  }
  
  try {
    const resourcesRef = collection(db, 'resources');
    const q = query(
      resourcesRef,
      where('class', '==', classId)
    );
    
    console.log('fetchSubjects: Executing query to Firestore');
    const querySnapshot = await getDocs(q);
    console.log('fetchSubjects: Query completed, document count:', querySnapshot.size);
    
    // Extract unique subjects
    const subjects = new Set<string>();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.subject) {
        subjects.add(data.subject);
      }
    });
    
    const subjectsList = Array.from(subjects);
    console.log('fetchSubjects: Found subjects:', subjectsList);
    return subjectsList;
  } catch (error) {
    console.error('fetchSubjects: Error fetching subjects:', error);
    throw error;
  }
};

// Fetch books based on class and subject selection
export const fetchBooks = async (classId: string, subjectId: string): Promise<string[]> => {
  console.log('fetchBooks: Starting with class:', classId, 'subject:', subjectId);
  
  if (classId === 'all' || subjectId === 'all') {
    console.log('fetchBooks: Class or subject is "all", returning empty array');
    return [];
  }
  
  try {
    // Query resources collection to get unique books for the given class and subject
    const q = query(
      collection(db, 'resources'),
      where('class', '==', classId),
      where('subject', '==', subjectId)
    );
    
    console.log('fetchBooks: Executing query to Firestore');
    const querySnapshot = await getDocs(q);
    console.log('fetchBooks: Query completed, document count:', querySnapshot.size);
    
    // Extract unique books from the results
    const booksSet = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.book) {
        booksSet.add(data.book);
      }
    });
    
    const books = Array.from(booksSet).sort();
    console.log('fetchBooks: Found books:', books);
    
    return books;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
};

/**
 * Fetch resources for multiple chapters
 * @param classId The class ID
 * @param subjectId The subject ID
 * @param chapters Array of chapter names to fetch resources for
 * @returns Array of resources
 */
export const fetchResourcesByChapters = async (
  classId: string, 
  subjectId: string, 
  chapters: string[],
  bookId?: string
): Promise<Resource[]> => {
  console.log('fetchResourcesByChapters: Starting with class:', classId, 'subject:', subjectId, 'chapters:', chapters, bookId ? `book: ${bookId}` : '');
  
  if (!classId || !subjectId || !chapters.length) {
    console.warn('fetchResourcesByChapters: Missing required parameters');
    return [];
  }
  
  try {
    const resourcesRef = collection(db, 'resources');
    const resources: Resource[] = [];
    
    // We need to query for each chapter separately since Firestore doesn't support OR queries with different fields
    for (const chapter of chapters) {
      console.log(`fetchResourcesByChapters: Querying for chapter: ${chapter}`);
      
      let q;
      
      if (bookId) {
        q = query(
          resourcesRef,
          where('class', '==', classId),
          where('subject', '==', subjectId),
          where('book', '==', bookId),
          where('chapter', '==', chapter)
        );
      } else {
        q = query(
          resourcesRef,
          where('class', '==', classId),
          where('subject', '==', subjectId),
          where('chapter', '==', chapter)
        );
      }
      
      const querySnapshot = await getDocs(q);
      console.log(`fetchResourcesByChapters: Found ${querySnapshot.size} resources for chapter ${chapter}`);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        resources.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          fileUrl: data.fileUrl || '',
          fileType: data.fileType || '',
          fileName: data.fileName || '',
          class: data.class || '',
          subject: data.subject || '',
          book: data.book || '',
          chapter: data.chapter || '',
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
          userId: data.userId || ''
        });
      });
    }
    
    console.log(`fetchResourcesByChapters: Total resources found: ${resources.length}`);
    return resources;
  } catch (error) {
    console.error('fetchResourcesByChapters: Error fetching resources:', error);
    throw error;
  }
};