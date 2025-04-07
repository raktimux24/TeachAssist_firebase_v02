import { Resource } from '../types/resource';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, DocumentReference, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { updateContentStats } from './contentStatsService';
import { v4 as uuidv4 } from 'uuid';

export interface Note {
  id: string;
  title: string;
  content: string;
}

export interface NotesSet {
  id: string;
  title: string;
  subject: string;
  class: string;
  book?: string; // Optional book property
  chapters: string[];
  type: string;
  layout: 'one-column' | 'two-column';
  notes: Note[];
  createdAt: Date;
  userId?: string; // Optional user ID for associating notes with a user
  firebaseId?: string; // Optional Firestore document ID
}

export interface NotesGenerationOptions {
  class: string;
  subject: string;
  book?: string; // Optional book property
  chapters: string[];
  title?: string; // Add optional title property
  noteType: string;
  layout: 'one-column' | 'two-column';
  includeDefinitions: boolean;
  includeTheorems: boolean;
  includeFormulas: boolean;
  includeKeyPoints: boolean;
  includeSummaries: boolean;
  includeDiscussionQuestions: boolean;
  additionalInstructions: string;
  resources: Resource[];
  userId?: string; // Optional user ID for associating notes with a user
}

// Import the unified AI service
import { generateContent } from './aiService';

/**
 * Generates notes using the OpenAI API based on PDF content and user preferences
 * and saves them to Firestore
 */
export const generateNotes = async (options: NotesGenerationOptions): Promise<NotesSet> => {
  try {
    console.log('Generating notes with options:', options);
    
    // Log generation attempt
    console.log('Attempting to generate notes with AI service');
    
    // Extract PDF URLs from resources
    const pdfUrls = options.resources.map(resource => resource.fileUrl);
    
    if (pdfUrls.length === 0) {
      throw new Error('No PDF resources found for the selected criteria');
    }
    
    // Create the system prompt
    const systemPrompt = createSystemPrompt(options);
    
    // Create the user prompt with PDF URLs
    const userPrompt = createUserPrompt(options, pdfUrls);
    
    console.log('System prompt:', systemPrompt);
    console.log('User prompt:', userPrompt);
    
    // Call AI service (OpenAI with Gemini fallback)
    console.log('Calling AI service for notes generation...');
    const content = await generateContent(systemPrompt, userPrompt);
    
    console.log('AI service response received successfully');
    
    console.log('Raw OpenAI response:', content);
    
    // Parse the response into a NotesSet
    const notesSet = parseOpenAIResponse(content, options);
    
    // Add the user ID if provided
    if (options.userId) {
      notesSet.userId = options.userId;
    }
    
    // Save to Firestore
    const firestoreDocRef = await saveNotesToFirestore(notesSet, systemPrompt, userPrompt);
    
    // Add the Firestore document ID to the notes set
    if (firestoreDocRef) {
      notesSet.firebaseId = firestoreDocRef.id;
    }
    
    // Log the successful generation
    console.log(`Successfully generated notes for ${options.subject} - ${options.chapters.join(', ')}`);
    console.log('Generated notes set:', notesSet);
    
    return notesSet;
    
  } catch (error) {
    console.error('Error generating notes:', error);
    throw error;
  }
};

/**
 * Saves the generated notes to Firestore
 */
export const saveNotesToFirestore = async (
  notesSet: NotesSet,
  systemPrompt?: string,
  userPrompt?: string
): Promise<DocumentReference | null> => {
  try {
    // Create a Firestore-friendly version of the notes set
    // Convert Date objects to Firestore Timestamps
    const firestoreNotesSet = {
      title: notesSet.title,
      subject: notesSet.subject,
      class: notesSet.class,
      book: notesSet.book || null,
      chapters: notesSet.chapters,
      type: notesSet.type,
      layout: notesSet.layout,
      notes: notesSet.notes,
      userId: notesSet.userId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Save the OpenAI API request data
      apiRequestData: {
        systemPrompt: systemPrompt || '',
        userPrompt: userPrompt || ''
      }
    };
    
    // Add to the classnotes collection
    const docRef = await addDoc(collection(db, 'classnotes'), firestoreNotesSet);
    console.log('Notes saved to Firestore with ID:', docRef.id);
    
    // Update content stats if userId is provided
    if (notesSet.userId) {
      await updateContentStats(notesSet.userId, {
        type: 'notes',
        operation: 'increment'
      });
    }
    
    return docRef;
  } catch (error) {
    console.error('Error saving notes to Firestore:', error);
    return null;
  }
};

/**
 * Deletes a notes document from Firestore by ID
 */
export const deleteNotes = async (noteId: string): Promise<boolean> => {
  try {
    if (!noteId) {
      throw new Error('Note ID is required to delete notes');
    }
    
    // Delete the document from Firestore
    await deleteDoc(doc(db, 'classnotes', noteId));
    console.log('Notes deleted from Firestore with ID:', noteId);
    
    return true;
  } catch (error) {
    console.error('Error deleting notes from Firestore:', error);
    return false;
  }
};

/**
 * Retrieves all notes for a specific user from Firestore
 */
export const getUserNotes = async (userId: string): Promise<NotesSet[]> => {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch notes');
    }
    
    // Create a query to get all notes for this user
    const q = query(
      collection(db, 'classnotes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    // Execute the query
    const querySnapshot = await getDocs(q);
    
    // Convert the query results to NotesSet objects
    const notes: NotesSet[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      const createdAt = data.createdAt?.toDate() || new Date();
      
      // Create a NotesSet object from the document data
      const notesSet: NotesSet = {
        id: doc.id,
        title: data.title || '',
        subject: data.subject || '',
        class: data.class || '',
        book: data.book || '',
        chapters: data.chapters || [],
        type: data.type || '',
        layout: data.layout || 'one-column',
        notes: data.notes || [],
        createdAt: createdAt,
        userId: data.userId,
        firebaseId: doc.id
      };
      
      notes.push(notesSet);
    });
    
    return notes;
  } catch (error) {
    console.error('Error fetching user notes:', error);
    return [];
  }
};

/**
 * Creates the system prompt for the OpenAI API
 */
const createSystemPrompt = (options: NotesGenerationOptions): string => {
  const noteTypeDescription = getNoteTypeDescription(options.noteType);
  
  return `You are an expert educational content creator specializing in creating high-quality notes for students.
Your task is to generate a set of notes based on the PDF content that will be provided.
The notes should be tailored for ${options.class} students studying ${options.subject}${options.book ? ` using the book "${options.book}"` : ''}.

The notes should follow the "${noteTypeDescription}" format and include the following types of content:
${options.includeDefinitions ? '- Definitions of key terms and concepts' : ''}
${options.includeTheorems ? '- Important theorems and principles' : ''}
${options.includeFormulas ? '- Relevant formulas and equations' : ''}
${options.includeKeyPoints ? '- Key points and takeaways' : ''}
${options.includeSummaries ? '- Brief summaries of important topics' : ''}
${options.includeDiscussionQuestions ? '- Discussion questions to promote critical thinking' : ''}

Layout format: ${options.layout === 'one-column' ? 'Single column layout' : 'Two column layout with main content on the left and supplementary information on the right'}

${options.additionalInstructions ? `Additional instructions: ${options.additionalInstructions}` : ''}

Format your response as a JSON object with the following structure:
{
  "title": "Notes title",
  "subject": "${options.subject}",
  "class": "${options.class}",
  "book": "${options.book || ''}",
  "chapters": [${options.chapters.map(chapter => `"${chapter}"`).join(', ')}],
  "type": "${options.noteType}",
  "layout": "${options.layout}",
  "notes": [
    {
      "id": "1",
      "title": "Section title",
      "content": "Content of the section with appropriate markdown formatting"
    },
    ...more sections
  ]
}

Important formatting guidelines:
1. Use proper markdown formatting for the content field in each note
2. For headings, use # for main headings, ## for subheadings, etc.
3. For lists, use - or * for bullet points, and 1. 2. 3. for numbered lists
4. For emphasis, use *italic* or **bold**
5. For code or formulas, use \`inline code\` or \`\`\`code blocks\`\`\`
6. For tables, use markdown table syntax
7. Ensure the content is comprehensive, clear, and educationally valuable

IMPORTANT: Your response must be a valid JSON object without any additional text before or after it.`;
};

/**
 * Creates the user prompt for the OpenAI API
 */
const createUserPrompt = (options: NotesGenerationOptions, pdfUrls: string[]): string => {
  return `Please create notes for ${options.class} ${options.subject}${options.book ? ` from the book "${options.book}"` : ''} covering the following chapters: ${options.chapters.join(', ')}.
  
The content is available in the following PDF files:
${pdfUrls.map(url => `- ${url}`).join('\n')}

You need to parse these PDFs and extract the relevant information to create notes according to my requirements.
Please make sure the notes are accurate, comprehensive, and follow educational best practices.

Remember to format your response as a valid JSON object with the structure I specified.`;
};

/**
 * Parses the OpenAI API response into a NotesSet
 */
const parseOpenAIResponse = (content: string, options: NotesGenerationOptions): NotesSet => {
  try {
    // Try to parse the JSON response
    let parsedContent: NotesSet | null = null;
    
    // First try direct JSON parsing
    try {
      parsedContent = JSON.parse(content);
      console.log('Successfully parsed JSON directly');
    } catch (directParseError) {
      console.error('Direct JSON parsing failed:', directParseError);
      
      // Try to extract JSON from the response using regex
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonContent = jsonMatch[0];
          parsedContent = JSON.parse(jsonContent);
          console.log('Successfully parsed JSON using regex extraction');
        } else {
          console.error('No JSON object found in the response');
          
          // If no JSON found, create a simple structure with the raw content
          console.log('Creating fallback structure from raw content');
          parsedContent = {
            id: uuidv4(),
            title: `${options.subject} - ${options.chapters.join(', ')} Notes`,
            subject: options.subject,
            class: options.class,
            book: options.book,
            chapters: options.chapters,
            type: options.noteType,
            layout: options.layout,
            notes: [{
              id: '1',
              title: 'Generated Content',
              content: content.replace(/```/g, '').trim()
            }],
            createdAt: new Date()
          };
        }
      } catch (regexParseError) {
        console.error('Regex JSON parsing failed:', regexParseError);
      }
    }
    
    // If we successfully parsed the content, validate and return it
    if (parsedContent) {
      // Ensure all required fields are present
      if (!parsedContent.title) {
        parsedContent.title = `${options.subject} - ${options.chapters.join(', ')} Notes`;
      }
      
      if (!parsedContent.subject) {
        parsedContent.subject = options.subject;
      }
      
      if (!parsedContent.class) {
        parsedContent.class = options.class;
      }
      
      if (!parsedContent.book && options.book) {
        parsedContent.book = options.book;
      }
      
      if (!parsedContent.chapters || !Array.isArray(parsedContent.chapters)) {
        parsedContent.chapters = options.chapters;
      }
      
      if (!parsedContent.type) {
        parsedContent.type = options.noteType;
      }
      
      if (!parsedContent.layout) {
        parsedContent.layout = options.layout;
      }
      
      // Ensure notes array exists and has valid structure
      if (!parsedContent.notes || !Array.isArray(parsedContent.notes) || parsedContent.notes.length === 0) {
        console.warn('Notes array is empty or invalid, creating default notes');
        parsedContent.notes = createDefaultNotes(options);
      } else {
        // Validate each note and fix any issues
        parsedContent.notes = parsedContent.notes.map((note, index) => {
          if (!note.id) {
            note.id = (index + 1).toString();
          }
          
          if (!note.title) {
            note.title = `Section ${index + 1}`;
          }
          
          if (!note.content) {
            note.content = 'No content available for this section.';
          }
          
          return note;
        });
      }
      
      // Add creation timestamp
      parsedContent.createdAt = new Date();
      
      return parsedContent;
    }
    
    // If parsing fails, create default notes
    console.warn('Failed to parse OpenAI response, creating default notes');
    return createDefaultNotesSet(options);
    
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    return createDefaultNotesSet(options);
  }
};

/**
 * Creates default notes if parsing fails
 */
const createDefaultNotes = (options: NotesGenerationOptions): Note[] => {
  return [
    {
      id: '1',
      title: 'Introduction',
      content: `# Introduction to ${options.subject}\n\nThis section provides an overview of the key concepts covered in ${options.chapters.join(', ')}.`
    },
    {
      id: '2',
      title: 'Key Concepts',
      content: '## Key Concepts\n\n- Concept 1: Description of concept 1\n- Concept 2: Description of concept 2\n- Concept 3: Description of concept 3'
    },
    {
      id: '3',
      title: 'Definitions',
      content: '## Important Definitions\n\n**Term 1**: Definition of term 1\n\n**Term 2**: Definition of term 2\n\n**Term 3**: Definition of term 3'
    },
    {
      id: '4',
      title: 'Summary',
      content: '## Summary\n\nThis section summarizes the key points covered in the notes.'
    }
  ];
};

/**
 * Creates a default NotesSet if parsing fails
 */
const createDefaultNotesSet = (options: NotesGenerationOptions): NotesSet => {
  return {
    id: '',
    title: `${options.subject} - ${options.chapters.join(', ')} Notes`,
    subject: options.subject,
    class: options.class,
    book: options.book,
    chapters: options.chapters,
    type: options.noteType,
    layout: options.layout,
    notes: createDefaultNotes(options),
    createdAt: new Date()
  };
};

/**
 * Gets a description of the note type
 */
const getNoteTypeDescription = (noteType: string): string => {
  switch (noteType) {
    case 'bullet-points':
      return `Bullet Points - Create concise, scannable notes using bullet point format for the selected book content:
• Extract only information found within the provided book selection
• Use short, focused phrases for each bullet point
• Organize information into clear categories with main bullets and sub-bullets
• Include only key facts, concepts, and terms from the text
• Use consistent formatting with one main idea per bullet
• Employ visual hierarchy with 2-3 levels maximum
• Include white space between categories for improved readability
• Bold important terms or concepts mentioned in the book
• Focus on extracting core ideas from the selected content
• Use simple ASCII diagrams where helpful to visualize key concepts from the book
• Keep diagrams minimal and focused on essential relationships
• Use consistent formatting and indentation for better readability
• Use only keywords and phrases found in the book`;
    case 'outline':
      return `Outline Method - Create hierarchically structured notes based solely on the provided book selection:
• Use Roman numerals for main topics or sections from the text
• Use capital letters for subtopics mentioned in the selection
• Use numbers for details under subtopics from the book
• Use lowercase letters for further details from the text
• Maintain consistent indentation to show relationships between levels
• Include brief descriptive phrases based on the book's content
• Ensure organization reflects the structure present in the selection
• Create clear visual hierarchy through indentation and numbering
• Preserve the logical flow presented in the selected text
• Use only keywords and phrases found in the book
• Include basic ASCII diagrams when needed to represent hierarchical relationships or processes described in the text`;
    case 'detailed':
      return `Detailed Notes - Create comprehensive notes with complete explanations from the selected book content:
• Use section headings that mirror the book's organization
• Include thorough explanations of concepts presented in the text
• Provide examples mentioned in the book selection
• Explain relationships between ideas as described in the text
• Include definitions, formulas, and terminology from the selection
• Incorporate any visual elements referenced in the book
• Add clarifying information presented in the selection
• Use transitional language that follows the book's flow
• Include applications or contexts mentioned in the text
• Note any exceptions or limitations discussed in the selection
• Maintain the tone and terminology used in the book
• Focus only on content explicitly provided in the selection
• Create ASCII diagrams to visualize complex concepts, processes, or relationships presented in the book
• Ensure diagrams accurately represent information found in the text
• Label all elements of the diagram using terminology from the book
• Add brief explanations beneath diagrams to clarify their meaning
• Use only keywords and phrases found in the book
• Use consistent formatting and indentation for better readability`;
    case 'important-qa':
      return `Important Questions & Definitions - Create focused notes centered on key questions and definitions from the selected book content:
• Format based only on information presented in the text
• For Questions:
  - Develop questions that can be answered from the selection
  - Provide answers using only information in the text
  - Organize questions following the book's structure
  - Include conceptual questions about material in the selection
• For Definitions:
  - Extract terms and definitions explicitly mentioned in the book
  - Arrange terms following the order they appear in the text
  - Include examples of terms as presented in the selection
  - Note relationships between terms as described in the book
  - Clarify distinctions between terms as explained in the text
  - Bold all defined terms for easy scanning
  - Include ASCII diagrams where they help clarify definitions or answer questions based on the text
  - Ensure diagrams directly support understanding of specific terms or concepts from the book`;
    case 'theorems-formulas':
      return `Theorems & Formulas - Create STEM-focused notes emphasizing theorems, formulas, and applications from the selected book content:
• Format theorems and laws exactly as presented in the text
• Present formulas using the notation found in the book
• Include any derivations provided in the selection
• Add explanatory notes about applications as described in the text
• Provide examples exactly as shown in the book
• Include variations and special cases mentioned in the selection
• Note any constraints or limitations discussed in the text
• Organize related concepts following the book's structure
• Include any visual representations referenced in the selection
• Maintain all units of measurement as presented in the book
• Note connections between concepts as explained in the text
• Include any experimental or practical aspects mentioned
• Preserve any historical context provided in the selection
• Focus exclusively on theorems, formulas, and principles from the book
• Use ASCII diagrams to illustrate applications of theorems or formulas mentioned in the book
• Create visual representations of mathematical concepts, scientific processes, or engineering principles from the text
• Include coordinate systems, graphs, circuit diagrams, or other visual aids as appropriate
• Ensure all diagram elements are properly labeled using the book's terminology
• Position diagrams near the relevant theorems or formulas they illustrate
• Use only keywords and phrases found in the book
• Use consistent formatting and indentation for better readability`;
    default:
      return 'Standard notes format focusing exclusively on content from the selected book';
  }
};

/**
 * Creates a new notes set in Firestore
 */
export const createNotesSet = async (notesSet: Omit<NotesSet, 'id' | 'createdAt'>): Promise<DocumentReference> => {
  try {
    // Create the notes set
    const docRef = await addDoc(collection(db, 'classnotes'), {
      ...notesSet,
      createdAt: serverTimestamp()
    });

    // Update content stats if userId is provided
    if (notesSet.userId) {
      await updateContentStats(notesSet.userId, {
        type: 'notes',
        operation: 'increment'
      });
    }

    return docRef;
  } catch (error) {
    console.error('Error creating notes set:', error);
    throw error;
  }
};

/**
 * Deletes a notes set from Firestore
 */
export const deleteNotesSet = async (notesSetId: string, userId: string): Promise<void> => {
  try {
    // Delete the notes set
    await deleteDoc(doc(db, 'classnotes', notesSetId));

    // Update content stats
    await updateContentStats(userId, {
      type: 'notes',
      operation: 'decrement'
    });
  } catch (error) {
    console.error('Error deleting notes set:', error);
    throw error;
  }
};
