import { Resource } from '../types/resource';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, DocumentReference, query, where, orderBy, getDocs } from 'firebase/firestore';

export interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[]; // For MCQ
  answer?: string; // Answer or correct option
  explanation?: string; // Explanation of the answer
}

export interface QuestionSet {
  title: string;
  subject: string;
  class: string;
  chapters: string[];
  difficulty: string;
  includeAnswers: boolean;
  questions: Question[];
  createdAt: Date;
  userId?: string; // Optional user ID for associating question sets with a user
  firebaseId?: string; // Optional Firestore document ID
}

export interface QuestionSetGenerationOptions {
  class: string;
  subject: string;
  chapters: string[];
  title?: string; // Add optional title property
  difficulty: string;
  includeAnswers: boolean;
  questionTypes: Record<string, number>; // Type of question and count
  resources: Resource[];
  userId?: string; // Optional user ID for associating question sets with a user
}

// OpenAI API configuration - use environment variable
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generates a question set using the OpenAI API based on PDF content and user preferences
 * and saves it to Firestore
 */
export const generateQuestionSet = async (options: QuestionSetGenerationOptions): Promise<QuestionSet> => {
  try {
    console.log('Generating question set with options:', options);
    
    // Get API key from environment variable
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    
    console.log('OpenAI API Key exists:', !!OPENAI_API_KEY);
    console.log('OpenAI API Key length:', OPENAI_API_KEY ? OPENAI_API_KEY.length : 0);
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured in environment variables');
    }
    
    // Extract PDF URLs from resources
    const pdfUrls = options.resources.map(resource => resource.fileUrl);
    console.log('PDF URLs:', pdfUrls);
    
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
    console.log('Calling OpenAI API...');
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
    
    console.log('OpenAI API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error details:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw OpenAI response:', content);
    
    // Parse the response into a QuestionSet
    const questionSet = parseOpenAIResponse(content, options);
    
    // Add the user ID if provided
    if (options.userId) {
      questionSet.userId = options.userId;
    }
    
    // Save to Firestore
    const firestoreDocRef = await saveQuestionSetToFirestore(
      questionSet, 
      systemPrompt, 
      userPrompt, 
      options
    );
    
    // Add the Firestore document ID to the question set
    if (firestoreDocRef) {
      questionSet.firebaseId = firestoreDocRef.id;
    }
    
    // Log the successful generation
    console.log(`Successfully generated question set for ${options.subject} - ${options.chapters.join(', ')}`);
    console.log('Generated question set:', questionSet);
    
    return questionSet;
    
  } catch (error) {
    console.error('Error generating question set:', error);
    throw error;
  }
};

/**
 * Saves the generated question set to Firestore
 */
export const saveQuestionSetToFirestore = async (
  questionSet: QuestionSet,
  systemPrompt?: string,
  userPrompt?: string,
  generationOptions?: QuestionSetGenerationOptions
): Promise<DocumentReference | null> => {
  try {
    // Create a Firestore-friendly version of the question set
    // Convert Date objects to Firestore Timestamps
    const firestoreQuestionSet = {
      title: questionSet.title,
      subject: questionSet.subject,
      class: questionSet.class,
      chapters: questionSet.chapters,
      difficulty: questionSet.difficulty,
      includeAnswers: questionSet.includeAnswers,
      questions: questionSet.questions,
      userId: questionSet.userId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Save the OpenAI API request data
      apiRequestData: {
        systemPrompt: systemPrompt || '',
        userPrompt: userPrompt || ''
      },
      // Save the generation options
      generationOptions: generationOptions ? {
        class: generationOptions.class,
        subject: generationOptions.subject,
        chapters: generationOptions.chapters,
        difficulty: generationOptions.difficulty,
        includeAnswers: generationOptions.includeAnswers,
        questionTypes: generationOptions.questionTypes,
        // Don't save the full resources to avoid large document size
        resourceCount: generationOptions.resources.length,
        resourceIds: generationOptions.resources.map(r => r.id)
      } : null
    };
    
    // Add to the questionsets collection with retry logic
    let retries = 3;
    let docRef: DocumentReference | null = null;
    
    while (retries > 0) {
      try {
        docRef = await addDoc(collection(db, 'questionsets'), firestoreQuestionSet);
        console.log('Question set saved to Firestore with ID:', docRef.id);
        return docRef;
      } catch (error) {
        console.warn(`Error saving question set to Firestore (attempt ${4 - retries}/3):`, error);
        retries--;
        
        if (retries === 0) {
          // If all retries fail, log the error but don't throw
          console.error('Failed to save question set to Firestore after multiple attempts');
          
          // Save to localStorage as a fallback
          try {
            const localStorageKey = `questionset_${new Date().getTime()}`;
            localStorage.setItem(localStorageKey, JSON.stringify({
              ...firestoreQuestionSet,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              _localStorageKey: localStorageKey,
              _failedFirestoreSave: true
            }));
            console.log('Saved question set to localStorage as fallback with key:', localStorageKey);
          } catch (localStorageError) {
            console.error('Error saving to localStorage:', localStorageError);
          }
          
          return null;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = 1000 * Math.pow(2, 3 - retries);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return docRef; // This should never be reached due to the return in the try block or the return null in the catch block
  } catch (error) {
    console.error('Error in saveQuestionSetToFirestore:', error);
    return null;
  }
};

/**
 * Retrieves all question sets for a specific user from Firestore
 */
export const getUserQuestionSets = async (userId: string): Promise<QuestionSet[]> => {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch question sets');
    }
    
    // Create a query to get all question sets for this user
    const q = query(
      collection(db, 'questionsets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    // Execute the query
    const querySnapshot = await getDocs(q);
    
    // Convert the query results to QuestionSet objects
    const questionSets: QuestionSet[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      const createdAt = data.createdAt?.toDate() || new Date();
      
      // Create a QuestionSet object from the document data
      const questionSet: QuestionSet = {
        title: data.title || '',
        subject: data.subject || '',
        class: data.class || '',
        chapters: data.chapters || [],
        difficulty: data.difficulty || 'medium',
        includeAnswers: data.includeAnswers !== undefined ? data.includeAnswers : true,
        questions: data.questions || [],
        createdAt: createdAt,
        userId: data.userId || null,
        firebaseId: doc.id
      };
      
      questionSets.push(questionSet);
    });
    
    return questionSets;
  } catch (error) {
    console.error('Error fetching user question sets:', error);
    throw error;
  }
};

/**
 * Creates the system prompt for the OpenAI API
 */
const createSystemPrompt = (options: QuestionSetGenerationOptions): string => {
  return `You are an expert educational content creator specializing in creating high-quality question sets for students.
Your task is to generate a set of questions based on the PDF content that will be provided.
The questions should be tailored for ${options.class} students studying ${options.subject}.

The question set should include the following types of questions:
${Object.entries(options.questionTypes)
  .filter(([_, count]) => count > 0)
  .map(([type, count]) => `- ${count} ${type.replace('-', ' ')} questions`)
  .join('\n')}

Difficulty level: ${options.difficulty}
${options.includeAnswers ? 'Include answers and explanations for each question.' : 'Do not include answers or explanations.'}

Question Type Descriptions:
- MCQ (Multiple Choice Questions): These are one-mark questions with four options, testing recall or conceptual understanding.
- True/False: These are a format of objective-type questions where a statement must be judged as either correct or incorrect.
- Short Answers: These questions require a brief explanation or a paragraph to test understanding and concise articulation of key points.
- Long Answers: These are essay-type questions demanding detailed explanations, derivations, or essays to evaluate in-depth knowledge and written expression.
- Fill in the Blanks: These are objective-type questions where students must complete a sentence with the missing word(s).
- Passage Based / Source Based / Extract Based: These competency-based questions are framed around provided text, data, or scenarios, requiring students to apply concepts for interpretation or analysis.

Format your response as a JSON object with the following structure:
{
  "title": "Question Set title",
  "subject": "${options.subject}",
  "class": "${options.class}",
  "chapters": [${options.chapters.map(chapter => `"${chapter}"`).join(', ')}],
  "difficulty": "${options.difficulty}",
  "includeAnswers": ${options.includeAnswers},
  "questions": [
    {
      "id": "1",
      "type": "mcq",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Correct option (e.g., 'Option A')",
      "explanation": "Explanation of why this is the correct answer"
    },
    {
      "id": "2",
      "type": "true-false",
      "question": "Statement to evaluate as true or false",
      "answer": "True or False",
      "explanation": "Explanation of why the statement is true or false"
    },
    {
      "id": "3",
      "type": "short-answers",
      "question": "Short answer question",
      "answer": "Expected answer",
      "explanation": "Additional context or explanation"
    },
    {
      "id": "4",
      "type": "long-answers",
      "question": "Long answer question",
      "answer": "Expected answer outline or key points",
      "explanation": "Grading criteria or important points to include"
    },
    {
      "id": "5",
      "type": "fill-in-blanks",
      "question": "Sentence with _____ to fill in",
      "answer": "Word that goes in the blank",
      "explanation": "Why this word is correct"
    },
    {
      "id": "6",
      "type": "passage-based",
      "question": "Passage followed by a question",
      "answer": "Expected answer",
      "explanation": "Explanation of how to derive the answer from the passage"
    }
  ]
}

Important formatting guidelines:
1. Use proper markdown formatting for the question text
2. For MCQs, provide exactly 4 options
3. For True/False, the answer should be either "True" or "False"
4. For Short Answers, provide a concise expected answer
5. For Long Answers, provide key points that should be included
6. For Fill in the Blanks, use underscores (___) to indicate blanks
7. For Passage Based questions, include both the passage and the question
8. If includeAnswers is false, still include the answers in the JSON, they will be filtered out on the client side

IMPORTANT: Your response must be a valid JSON object without any additional text before or after it.`;
};

/**
 * Creates the user prompt for the OpenAI API
 */
const createUserPrompt = (options: QuestionSetGenerationOptions, pdfUrls: string[]): string => {
  return `Please generate a question set for ${options.class} students studying ${options.subject}, specifically covering the following chapters: ${options.chapters.join(', ')}.

The question set should include:
${Object.entries(options.questionTypes)
  .filter(([_, count]) => count > 0)
  .map(([type, count]) => `- ${count} ${type.replace('-', ' ')} questions`)
  .join('\n')}

Difficulty level: ${options.difficulty}
${options.includeAnswers ? 'Include answers and explanations for each question.' : 'Do not include answers or explanations.'}

The following PDF resources are available for reference:
${pdfUrls.map(url => `- ${url}`).join('\n')}

Please ensure the questions are relevant to the chapters specified and appropriate for the difficulty level.`;
};

/**
 * Parses the OpenAI API response into a QuestionSet
 */
const parseOpenAIResponse = (content: string, options: QuestionSetGenerationOptions): QuestionSet => {
  try {
    // Try to parse the response as JSON
    const parsedResponse = JSON.parse(content);
    
    // Validate the response has the expected structure
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      console.error('Invalid response format, missing questions array:', parsedResponse);
      return createDefaultQuestionSet(options);
    }
    
    // Create the QuestionSet object
    const questionSet: QuestionSet = {
      title: parsedResponse.title || `${options.subject} Question Set: ${options.chapters.join(', ')}`,
      subject: parsedResponse.subject || options.subject,
      class: parsedResponse.class || options.class,
      chapters: parsedResponse.chapters || options.chapters,
      difficulty: parsedResponse.difficulty || options.difficulty,
      includeAnswers: parsedResponse.includeAnswers !== undefined ? parsedResponse.includeAnswers : options.includeAnswers,
      questions: parsedResponse.questions.map((q: any, index: number) => ({
        id: q.id || `${index + 1}`,
        type: q.type || 'unknown',
        question: q.question || '',
        options: q.options || undefined,
        answer: options.includeAnswers ? q.answer || '' : undefined,
        explanation: options.includeAnswers ? q.explanation || '' : undefined
      })),
      createdAt: new Date()
    };
    
    return questionSet;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    return createDefaultQuestionSet(options);
  }
};

/**
 * Creates a default QuestionSet if parsing fails
 */
const createDefaultQuestionSet = (options: QuestionSetGenerationOptions): QuestionSet => {
  const defaultQuestions: Question[] = [];
  
  // Create default questions based on the requested types and counts
  Object.entries(options.questionTypes).forEach(([type, count]) => {
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        defaultQuestions.push({
          id: `${defaultQuestions.length + 1}`,
          type,
          question: `Default ${type} question ${i + 1}`,
          options: type === 'mcq' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
          answer: options.includeAnswers ? 'Default answer' : undefined,
          explanation: options.includeAnswers ? 'Default explanation' : undefined
        });
      }
    }
  });
  
  return {
    title: `${options.subject} Question Set: ${options.chapters.join(', ')}`,
    subject: options.subject,
    class: options.class,
    chapters: options.chapters,
    difficulty: options.difficulty,
    includeAnswers: options.includeAnswers,
    questions: defaultQuestions,
    createdAt: new Date()
  };
};
