 import { Resource } from '../types/resource';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, DocumentReference, query, where, orderBy, getDocs } from 'firebase/firestore';

export interface Note {
  id: string;
  title: string;
  content: string;
}

export interface NotesSet {
  title: string;
  subject: string;
  class: string;
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

// OpenAI API configuration - use environment variable
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generates notes using the OpenAI API based on PDF content and user preferences
 * and saves them to Firestore
 */
export const generateNotes = async (options: NotesGenerationOptions): Promise<NotesSet> => {
  try {
    console.log('Generating notes with options:', options);
    
    // Get API key from environment variable
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured in environment variables');
    }
    
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
    
    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
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
    
    return docRef;
  } catch (error) {
    console.error('Error saving notes to Firestore:', error);
    return null;
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
        title: data.title || '',
        subject: data.subject || '',
        class: data.class || '',
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
The notes should be tailored for ${options.class} students studying ${options.subject}.

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
  return `Please create notes for ${options.class} ${options.subject} covering the following chapters: ${options.chapters.join(', ')}.
  
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
    title: `${options.subject} - ${options.chapters.join(', ')} Notes`,
    subject: options.subject,
    class: options.class,
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
      return 'Bullet Points - concise, easy-to-scan notes organized in bullet point format';
    case 'outline':
      return 'Outline Method - hierarchical structure with main topics and subtopics';
    case 'detailed':
      return 'Detailed Notes - comprehensive notes with full explanations and examples';
    case 'important-qa':
      return 'Important Questions & Definitions - focused on key questions and term definitions';
    case 'theorems-formulas':
      return 'Theorems & Formulas - emphasis on mathematical theorems, formulas, and their applications';
    default:
      return 'Standard notes format';
  }
};
