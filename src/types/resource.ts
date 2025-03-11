export interface Resource {
  id?: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  classId: string;
  subjectId: string;
  bookId: string;
  chapterId: string;
  // Add the new field names used in fetchResources
  class?: string;
  subject?: string;
  book?: string;
  chapter?: string;
  tags: string[];
  uploadedBy: string;
  uploadedByName: string;
  createdAt: any;
  updatedAt: any;
}

export interface Class {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  classId: string;
  books: Book[];
}

export interface Book {
  id: string;
  name: string;
  subjectId: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  name: string;
  bookId: string;
}

// Available options for the resource library
export const AVAILABLE_CLASSES = ['9', '10', '11', '12'] as const;
export const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Accounts',
  'Business Studies',
  'Economics',
  'Sociology',
  'Psychology',
  'Computer Science'
] as const; 