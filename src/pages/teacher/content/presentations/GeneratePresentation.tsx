import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import { 
  Book, 
  Chapter, 
  Class, 
  Resource, 
  Subject, 
  AVAILABLE_CLASSES, 
  AVAILABLE_SUBJECTS 
} from '../../../../types/resource';
import { 
  generatePresentation, 
  PresentationGenerationOptions
} from '../../../../services/presentationService';
import { templateOptions } from '../../../../components/teacher/content/presentations/PresentationTemplates';
import AdvancedSettings from './components/AdvancedSettings';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

interface GeneratePresentationProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

// Mock data for classes, subjects, books, and chapters
const mockClasses: Class[] = AVAILABLE_CLASSES.map((className: string, index: number) => ({
  id: `class-${index + 1}`,
  name: `Class ${className}`,
  subjects: []
}));

const mockSubjects: Subject[] = AVAILABLE_SUBJECTS.map((subjectName: string, index: number) => ({
  id: `subject-${index + 1}`,
  name: subjectName,
  classId: mockClasses[Math.floor(index % mockClasses.length)].id,
  books: []
}));

// Assign subjects to classes
mockClasses.forEach(classItem => {
  classItem.subjects = mockSubjects.filter(subject => subject.classId === classItem.id);
});

// Create mock books for each subject
const mockBooks: Book[] = mockSubjects.flatMap((subject, subjectIndex) => 
  Array.from({ length: 2 }, (_, bookIndex) => ({
    id: `book-${subjectIndex}-${bookIndex}`,
    name: `${subject.name} Book ${bookIndex + 1}`,
    subjectId: subject.id,
    chapters: []
  }))
);

// Assign books to subjects
mockSubjects.forEach(subject => {
  subject.books = mockBooks.filter(book => book.subjectId === subject.id);
});

// Create mock chapters for each book
const mockChapters: Chapter[] = mockBooks.flatMap((book, bookIndex) => 
  Array.from({ length: 5 }, (_, chapterIndex) => ({
    id: `chapter-${bookIndex}-${chapterIndex}`,
    name: `Chapter ${chapterIndex + 1}: ${getRandomChapterName(book.name)}`,
    bookId: book.id
  }))
);

// Assign chapters to books
mockBooks.forEach(book => {
  book.chapters = mockChapters.filter(chapter => chapter.bookId === book.id);
});

// Helper function to generate random chapter names
function getRandomChapterName(bookName: string): string {
  const mathChapters = ['Algebra Basics', 'Linear Equations', 'Quadratic Equations', 'Geometry', 'Trigonometry'];
  const physicsChapters = ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics'];
  const chemistryChapters = ['Atomic Structure', 'Chemical Bonding', 'Periodic Table', 'Organic Chemistry', 'Acids and Bases'];
  const biologyChapters = ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Physiology'];
  const englishChapters = ['Grammar', 'Literature', 'Writing Skills', 'Reading Comprehension', 'Communication'];
  
  if (bookName.includes('Mathematics')) return mathChapters[Math.floor(Math.random() * mathChapters.length)];
  if (bookName.includes('Physics')) return physicsChapters[Math.floor(Math.random() * physicsChapters.length)];
  if (bookName.includes('Chemistry')) return chemistryChapters[Math.floor(Math.random() * chemistryChapters.length)];
  if (bookName.includes('Biology')) return biologyChapters[Math.floor(Math.random() * biologyChapters.length)];
  if (bookName.includes('English')) return englishChapters[Math.floor(Math.random() * englishChapters.length)];
  
  return `Topic ${Math.floor(Math.random() * 10) + 1}`;
}

// Mock resources for the selected criteria
const mockResources: Resource[] = mockChapters.map((chapter, index) => {
  const book = mockBooks.find(b => b.id === chapter.bookId)!;
  const subject = mockSubjects.find(s => s.id === book.subjectId)!;
  const classItem = mockClasses.find(c => c.id === subject.classId)!;
  
  return {
    id: `resource-${index}`,
    title: `${chapter.name} - Study Material`,
    description: `Comprehensive study material for ${chapter.name}`,
    fileUrl: `https://example.com/resources/${subject.name.toLowerCase().replace(' ', '_')}/${chapter.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
    fileName: `${chapter.name}.pdf`,
    fileType: 'application/pdf',
    fileSize: Math.floor(Math.random() * 5000000) + 1000000, // Random size between 1-6MB
    classId: classItem.id,
    subjectId: subject.id,
    bookId: book.id,
    chapterId: chapter.id,
    class: classItem.name,
    subject: subject.name,
    book: book.name,
    chapter: chapter.name,
    tags: ['study material', 'pdf', subject.name.toLowerCase()],
    uploadedBy: 'teacher-1',
    uploadedByName: 'John Doe',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
});

// Presentation types
const presentationTypes = [
  { id: 'topic-wise', name: 'Topic Wise' },
  { id: 'chapter-summary', name: 'Chapter Summary' },
  { id: 'concept-explanation', name: 'Concept Explanation' },
  { id: 'problem-solving', name: 'Problem Solving' },
  { id: 'revision', name: 'Revision' }
];

export default function GeneratePresentation({ isDarkMode, onThemeToggle }: GeneratePresentationProps) {
  const navigate = useNavigate();
  
  // Form state
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [presentationType, setPresentationType] = useState<string>(presentationTypes[0].id);
  
  // Advanced settings
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [slideCount, setSlideCount] = useState<number>(10);
  const [designTemplate, setDesignTemplate] = useState<string>(templateOptions[0].id);
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');
  
  // Filtered options based on selections
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Update filtered subjects when class changes
  useEffect(() => {
    if (selectedClass) {
      const subjects = mockSubjects.filter(subject => 
        mockClasses.find(c => c.name === selectedClass)?.id === subject.classId
      );
      setFilteredSubjects(subjects);
      setSelectedSubject('');
      setSelectedBook('');
      setSelectedChapters([]);
    } else {
      setFilteredSubjects([]);
    }
  }, [selectedClass]);
  
  // Update filtered books when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const books = mockBooks.filter(book => 
        mockSubjects.find(s => s.name === selectedSubject)?.id === book.subjectId
      );
      setFilteredBooks(books);
      setSelectedBook('');
      setSelectedChapters([]);
    } else {
      setFilteredBooks([]);
    }
  }, [selectedSubject]);
  
  // Update filtered chapters when book changes
  useEffect(() => {
    if (selectedBook) {
      const chapters = mockChapters.filter(chapter => 
        mockBooks.find(b => b.name === selectedBook)?.id === chapter.bookId
      );
      setFilteredChapters(chapters);
      setSelectedChapters([]);
    } else {
      setFilteredChapters([]);
    }
  }, [selectedBook]);
  
  // Handle chapter selection toggle
  const handleChapterToggle = (chapterName: string) => {
    setSelectedChapters(prev => {
      if (prev.includes(chapterName)) {
        return prev.filter(ch => ch !== chapterName);
      } else {
        return [...prev, chapterName];
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass || !selectedSubject || !selectedBook || selectedChapters.length === 0 || !presentationType) {
      setGenerationError('Please fill in all required fields');
      return;
    }
    
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      // Get resources for the selected criteria
      const resources = mockResources.filter(resource => 
        resource.class === selectedClass &&
        resource.subject === selectedSubject &&
        resource.book === selectedBook &&
        selectedChapters.includes(resource.chapter || '')
      );
      
      if (resources.length === 0) {
        throw new Error('No resources found for the selected criteria');
      }
      
      // Prepare generation options
      const options: PresentationGenerationOptions = {
        class: selectedClass,
        subject: selectedSubject,
        chapters: selectedChapters,
        presentationType,
        slideCount,
        designTemplate,
        additionalInstructions,
        resources
      };
      
      // Generate presentation
      const presentation = await generatePresentation(options);
      
      // Store the presentation in sessionStorage to access it in the results page
      sessionStorage.setItem('generatedPresentation', JSON.stringify(presentation));
      
      // Navigate to the results page
      navigate('/teacher/content/presentations/results');
      
    } catch (error) {
      console.error('Error generating presentation:', error);
      setGenerationError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Generate Presentation
        </h1>
        
        {isGenerating ? (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Generating your presentation... This may take a minute.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Settings */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Basic Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class Selection */}
                <div>
                  <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Class *
                  </label>
                  <select
                    id="class"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select a class</option>
                    {mockClasses.map((classItem) => (
                      <option key={classItem.id} value={classItem.name}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Subject Selection */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={!selectedClass}
                    required
                  >
                    <option value="">Select a subject</option>
                    {filteredSubjects.map((subject) => (
                      <option key={subject.id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Book Selection */}
                <div>
                  <label htmlFor="book" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Book *
                  </label>
                  <select
                    id="book"
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={!selectedSubject}
                    required
                  >
                    <option value="">Select a book</option>
                    {filteredBooks.map((book) => (
                      <option key={book.id} value={book.name}>
                        {book.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Presentation Type */}
                <div>
                  <label htmlFor="presentationType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Presentation Type *
                  </label>
                  <select
                    id="presentationType"
                    value={presentationType}
                    onChange={(e) => setPresentationType(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  >
                    {presentationTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Chapter Selection */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chapters * (Select at least one)
                </label>
                {selectedBook ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {filteredChapters.map((chapter) => (
                      <div key={chapter.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`chapter-${chapter.id}`}
                          checked={selectedChapters.includes(chapter.name)}
                          onChange={() => handleChapterToggle(chapter.name)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <label
                          htmlFor={`chapter-${chapter.id}`}
                          className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          {chapter.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Please select a book first
                  </p>
                )}
              </div>
            </div>
            
            {/* Advanced Settings Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                {showAdvancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
              </button>
            </div>
            
            {/* Advanced Settings */}
            {showAdvancedSettings && (
              <AdvancedSettings
                slideCount={slideCount}
                setSlideCount={setSlideCount}
                designTemplate={designTemplate}
                setDesignTemplate={setDesignTemplate}
                additionalInstructions={additionalInstructions}
                setAdditionalInstructions={setAdditionalInstructions}
              />
            )}
            
            {/* Error Message */}
            {generationError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {generationError}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={isGenerating || !selectedClass || !selectedSubject || !selectedBook || selectedChapters.length === 0}
              >
                Generate Presentation
              </button>
            </div>
          </form>
        )}
      </div>
    </TeacherLayout>
  );
}
