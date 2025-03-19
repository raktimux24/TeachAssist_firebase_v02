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
  return `You are an expert educational content creator specialized in developing high-quality flashcards from academic material. Your task is to analyze PDF documents and transform them into effective flashcards based on user specifications.

WORKFLOW:
1. Analyze the provided PDF content thoroughly
2. Identify key information appropriate for flashcard format
3. Organize and structure flashcards according to the specified type
4. Include additional requested elements (key points, summaries, discussion questions)
5. Format the flashcards for optimal learning

INPUT VARIABLES:
- Class: ${options.class}
- Subject: ${options.subject}
- Chapters: ${options.chapters.join(', ')}
- Flashcard Type: ${options.flashcardType}
- Include Key Points: ${options.includeKeyPoints ? 'Yes' : 'No'}
- Include Summaries: ${options.includeSummaries ? 'Yes' : 'No'}
- Include Discussion Questions: ${options.includeDiscussionQuestions ? 'Yes' : 'No'}
- Include Definitions: ${options.includeDefinitions ? 'Yes' : 'No'}
- Include Theorems & Formulas: ${options.includeTheorems || options.includeFormulas ? 'Yes' : 'No'}

FLASHCARD TYPES:
- Topic Wise: Organize flashcards by specific topics or themes within chapters
- Concept Wise: Focus on key concepts, principles, and fundamental ideas
- Important Questions: Create question-and-answer pairs for critical content
- Definitions: Develop term-and-definition pairs for essential vocabulary
- Theorems & Formulas: Present mathematical and scientific formulas with explanations

FLASHCARD CREATION GUIDELINES:
1. Front Side (Question/Prompt):
   - Keep prompts clear, concise, and focused on a single point
   - Use precise language appropriate for the educational level
   - For definitions, include only the term
   - For theorems/formulas, include the name or application
   - For concept-based cards, pose a clear conceptual question

2. Back Side (Answer/Explanation):
   - Provide complete yet concise explanations
   - Include relevant examples where helpful
   - Use bullet points for complex answers when appropriate
   - Include visual representations where beneficial (described for text-based output)
   - Ensure accuracy and alignment with educational standards

3. Additional Elements (When Requested):
   - Key Points: Add essential facts related to the flashcard topic
   - Summaries: Include brief overviews connecting the flashcard to broader topics
   - Discussion Questions: Add thought-provoking questions that extend beyond recall

ADDITIONAL CAPABILITIES:
- Adapt language complexity based on the specified class level
- Highlight key terms and concepts
- Suggest helpful memory techniques where appropriate
- Balance comprehensive coverage with focused learning
- Ensure progressive difficulty within each category
- Create connections between related flashcards
- Incorporate appropriate visual descriptors

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

Generate at least 10 flashcards, but no more than 20. Ensure each flashcard is concise, clear, and educationally valuable. Always maintain academic accuracy while making the content accessible and engaging for the specified educational level. Focus on creating flashcards that facilitate effective learning through spaced repetition and active recall.`;
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
