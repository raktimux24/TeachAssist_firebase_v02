import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { NotesSet, Note, saveNotesToFirestore } from '../../../../services/notesGeneration';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import '../../../../styles/markdown.css';
import { useAuth } from '../../../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import { generateDocument } from '../../../../services/documentGenerator';

interface NotesResultsProps {
  isDarkMode: boolean;
  noteId?: string; // Optional ID to load notes directly from Firestore
}

export default function NotesResults({ isDarkMode, noteId }: NotesResultsProps) {
  const navigate = useNavigate();
  const { noteId: urlNoteId } = useParams<{ noteId: string }>();
  const { currentUser } = useAuth();
  const [notesSet, setNotesSet] = useState<NotesSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true);
      
      // First, check if we have a noteId from props or URL params
      const firestoreNoteId = noteId || urlNoteId;
      
      if (firestoreNoteId) {
        try {
          // Try to load the notes from Firestore
          console.log(`Attempting to load notes from Firestore with ID: ${firestoreNoteId}`);
          const docRef = doc(db, 'classnotes', firestoreNoteId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Convert Firestore timestamps to Date objects
            const createdAt = data.createdAt?.toDate() || new Date();
            
            // Create a NotesSet object from the document data
            const loadedNotesSet: NotesSet = {
              id: docSnap.id, // Add the required id property
              title: data.title || '',
              subject: data.subject || '',
              class: data.class || '',
              chapters: data.chapters || [],
              type: data.type || '',
              layout: data.layout || 'one-column',
              notes: data.notes || [],
              createdAt: createdAt,
              userId: data.userId,
              firebaseId: docSnap.id
            };
            
            setNotesSet(loadedNotesSet);
            console.log(`Successfully loaded notes from Firestore with ${loadedNotesSet.notes?.length || 0} notes`);
            
            // Set the first note as active by default
            if (loadedNotesSet.notes && loadedNotesSet.notes.length > 0) {
              setActiveNoteId(loadedNotesSet.notes[0].id);
            }
          } else {
            console.log(`No notes found in Firestore with ID: ${firestoreNoteId}`);
            // If not found in Firestore, fall back to localStorage
            loadFromLocalStorage();
          }
        } catch (error) {
          console.error('Error loading notes from Firestore:', error);
          // Fall back to localStorage
          loadFromLocalStorage();
        }
      } else {
        // No Firestore ID provided, load from localStorage
        loadFromLocalStorage();
      }
      
      setLoading(false);
    };
    
    const loadFromLocalStorage = () => {
      // Load notes from localStorage
      const storedNotes = localStorage.getItem('generatedNotes');
      
      if (storedNotes) {
        try {
          console.log('Raw stored notes:', storedNotes);
          
          const parsedNotes = JSON.parse(storedNotes);
          console.log('Parsed notes:', parsedNotes);
          
          // Convert string dates back to Date objects
          if (typeof parsedNotes.createdAt === 'string') {
            parsedNotes.createdAt = new Date(parsedNotes.createdAt);
          }
          
          // Ensure notes array exists and has content
          if (!parsedNotes.notes || !Array.isArray(parsedNotes.notes) || parsedNotes.notes.length === 0) {
            console.error('Notes array is empty or invalid:', parsedNotes.notes);
            
            // Create a default note if none exists
            parsedNotes.notes = [
              {
                id: '1',
                title: 'Default Note',
                content: 'No content was generated. Please try again with different settings.'
              }
            ];
          }
          
          // Add user ID if available
          if (currentUser && !parsedNotes.userId) {
            parsedNotes.userId = currentUser.uid;
          }
          
          setNotesSet(parsedNotes);
          console.log(`Notes set successfully with ${parsedNotes.notes?.length || 0} notes`);
          
          // Set the first note as active by default
          if (parsedNotes.notes && parsedNotes.notes.length > 0) {
            setActiveNoteId(parsedNotes.notes[0].id);
            console.log(`Set active note ID to: ${parsedNotes.notes[0].id}`);
          }
          
          // If notes were loaded from localStorage and user is logged in, save to Firestore
          if (currentUser && !parsedNotes.firebaseId) {
            saveToFirestore(parsedNotes);
          }
        } catch (error) {
          console.error('Error parsing notes:', error);
          toast.error('Failed to load generated notes');
        }
      } else {
        // Don't show error if we're loading from a specific ID
        if (!noteId && !urlNoteId) {
          console.log('No stored notes found in localStorage');
          toast.error('No generated notes found');
        }
      }
    };
    
    loadNotes();
  }, [noteId, urlNoteId, currentUser]);
  
  const saveToFirestore = async (notes: NotesSet) => {
    try {
      if (!currentUser) {
        console.log('User not logged in, skipping Firestore save');
        return;
      }
      
      // Add user ID to notes
      notes.userId = currentUser.uid;
      
      // Save to Firestore
      const docRef = await saveNotesToFirestore(notes);
      
      if (docRef) {
        // Update the notes with the Firestore ID
        setNotesSet(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            firebaseId: docRef.id
          };
        });
        
        console.log(`Notes saved to Firestore with ID: ${docRef.id}`);
        toast.success('Notes saved to your account');
      }
    } catch (error) {
      console.error('Error saving notes to Firestore:', error);
    }
  };

  const handleGoBack = () => {
    navigate('/teacher/notes');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!notesSet) return;
    
    try {
      // Format notes data for document generation
      const notesData = {
        title: notesSet.title,
        subject: notesSet.subject,
        class: notesSet.class,
        type: notesSet.type || 'Class Notes',
        layout: notesSet.layout === 'two-column' ? 'two-column' : 'one-column',
        sections: notesSet.notes.map(note => ({
          title: note.title,
          content: note.content.split('\n').filter(line => line.trim() !== ''),
          type: 'text' as 'text' | 'definition' | 'formula' | 'key-point' | 'summary'
        }))
      };
      
      // Use the document generator service to create and download a Word document
      await generateDocument(notesData);
      toast.success('Notes downloaded as Word document');
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to download document. Please try again.');
    }
  };



  const getActiveNote = (): Note | null => {
    if (!notesSet || !activeNoteId) return null;
    return notesSet.notes.find(note => note.id === activeNoteId) || null;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDarkMode ? 'dark' : ''}`}>
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!notesSet) {
    return (
      <div className={`text-center py-10 ${isDarkMode ? 'dark' : ''}`}>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">No Notes Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn't find any generated notes. Please go back and generate new notes.
        </p>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
        >
          Back
        </button>

      </div>
    );
  }

  const activeNote = getActiveNote();

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {notesSet.title || 'Generated Notes'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {notesSet.subject} • {notesSet.class} • {notesSet.chapters.join(', ')}
          </p>
          {notesSet.firebaseId && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Saved to your account • ID: {notesSet.firebaseId}
            </p>
          )}
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={handleDownload}
            className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Download className="h-4 w-4 mr-1" />
            <span>Download</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Printer className="h-4 w-4 mr-1" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className={`flex ${notesSet.layout === 'two-column' ? 'flex-col md:flex-row' : 'flex-col'}`}>
          {/* Table of Contents - Always shown for both layouts */}
          <div className={`${notesSet.layout === 'two-column' ? 'md:w-1/4 border-r border-gray-200 dark:border-gray-700' : 'border-b border-gray-200 dark:border-gray-700'}`}>
            <div className="p-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Table of Contents</h2>
              <ul className="space-y-1">
                {notesSet.notes.map(note => (
                  <li key={note.id}>
                    <button
                      onClick={() => setActiveNoteId(note.id)}
                      className={`w-full text-left px-2 py-1 rounded-md ${
                        activeNoteId === note.id
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {note.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Notes Content */}
          <div className={`${notesSet.layout === 'two-column' ? 'md:w-3/4' : 'w-full'} p-6`}>
            {activeNote ? (
              <div className="prose dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 max-w-none">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{activeNote.title}</h2>
                <div className="markdown-content">
                  <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Select a section from the table of contents</p>
            )}
          </div>
        </div>
      </div>
      

    </div>
  );
}
