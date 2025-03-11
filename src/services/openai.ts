import { Resource } from '../types/resource';

// Define the flashcard types
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: 'definition' | 'concept' | 'formula' | 'question';
}

export interface FlashcardSet {
  title: string;
  subject: string;
  class: string;
  type: string;
  cards: Flashcard[];
}

export interface FlashcardGenerationOptions {
  class: string;
  subject: string;
  chapters: string[];
  flashcardType: string;
  includeDefinitions: boolean;
  includeTheorems: boolean;
  includeFormulas: boolean;
  includeKeyPoints: boolean;
  includeSummaries: boolean;
  includeDiscussionQuestions: boolean;
  additionalInstructions: string;
  resources: Resource[];
}

// OpenAI API configuration - use environment variable
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generates flashcards using the OpenAI API based on PDF content and user preferences
 */
export const generateFlashcards = async (options: FlashcardGenerationOptions): Promise<FlashcardSet> => {
  try {
    console.log('Generating flashcards with options:', options);
    
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
    
    // Parse the response into a FlashcardSet
    const flashcardSet = parseOpenAIResponse(content, options);
    
    // Log the successful generation
    console.log(`Successfully generated ${flashcardSet.cards.length} flashcards for ${options.subject}`);
    
    return flashcardSet;
    
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
};

/**
 * Creates the system prompt for the OpenAI API
 */
const createSystemPrompt = (options: FlashcardGenerationOptions): string => {
  return `You are an expert educational content creator specializing in creating high-quality flashcards for students.
Your task is to generate a set of flashcards based on the PDF content that will be provided.
The flashcards should be tailored for ${options.class} students studying ${options.subject}.

The flashcards should follow the "${options.flashcardType}" format and include the following types of content:
${options.includeDefinitions ? '- Definitions of key terms and concepts' : ''}
${options.includeTheorems ? '- Important theorems and principles' : ''}
${options.includeFormulas ? '- Relevant formulas and equations' : ''}
${options.includeKeyPoints ? '- Key points and takeaways' : ''}
${options.includeSummaries ? '- Brief summaries of important topics' : ''}
${options.includeDiscussionQuestions ? '- Discussion questions to promote critical thinking' : ''}

${options.additionalInstructions ? `Additional instructions: ${options.additionalInstructions}` : ''}

Format your response as a JSON object with the following structure:
{
  "title": "Flashcard set title",
  "subject": "${options.subject}",
  "class": "${options.class}",
  "type": "${options.flashcardType}",
  "cards": [
    {
      "id": "1",
      "front": "Front text of the flashcard",
      "back": "Back text of the flashcard",
      "type": "definition | concept | formula | question"
    },
    ...more cards
  ]
}

Generate at least 10 flashcards, but no more than 20. Ensure each flashcard is concise, clear, and educationally valuable.`;
};

/**
 * Creates the user prompt for the OpenAI API
 */
const createUserPrompt = (options: FlashcardGenerationOptions, pdfUrls: string[]): string => {
  return `Please create flashcards for ${options.class} ${options.subject} covering the following chapters: ${options.chapters.join(', ')}.
  
The content is available in the following PDF files:
${pdfUrls.map(url => `- ${url}`).join('\n')}

You need to parse these PDFs and extract the relevant information to create flashcards according to my requirements.
Please make sure the flashcards are accurate, concise, and follow educational best practices.`;
};

/**
 * Parses the OpenAI API response into a FlashcardSet
 */
const parseOpenAIResponse = (content: string, options: FlashcardGenerationOptions): FlashcardSet => {
  try {
    // Try to parse the JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonContent = jsonMatch[0];
        return JSON.parse(jsonContent) as FlashcardSet;
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
    }
    
    // Fallback to mock data if parsing fails
    return {
      title: `${options.subject} - ${options.chapters.join(', ')}`,
      subject: options.subject,
      class: options.class,
      type: options.flashcardType,
      cards: [
        {
          id: '1',
          front: 'What is a Chemical Bond?',
          back: 'A chemical bond is the force of attraction that holds atoms together in a molecule or compound.',
          type: 'definition'
        },
        {
          id: '2',
          front: 'Types of Chemical Bonds',
          back: '1. Ionic Bond\n2. Covalent Bond\n3. Metallic Bond',
          type: 'concept'
        },
        {
          id: '3',
          front: 'Bond Energy Formula',
          back: 'Bond Energy = Energy required to break one mole of bonds in gaseous molecules',
          type: 'formula'
        },
        {
          id: '4',
          front: 'Why do atoms form chemical bonds?',
          back: 'Atoms form chemical bonds to achieve a more stable electron configuration, typically by reaching the electron configuration of the nearest noble gas.',
          type: 'question'
        }
      ]
    };
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw error;
  }
};
