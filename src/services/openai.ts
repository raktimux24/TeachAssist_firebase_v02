import { Resource } from '../types/resource';

// Define the flashcard types
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: string;
  tags?: string[];
}

export interface FlashcardSet {
  title: string;
  class: string;
  subject: string;
  book: string;
  chapters: string[];
  flashcards: Flashcard[];
}

export interface FlashcardGenerationOptions {
  class: string;
  subject: string;
  book: string;
  chapters: string[];
  flashcardType: string;
  resources: Resource[];
  additionalInstructions: string;
}

// Import the unified AI service
import { generateContent } from './aiService';

/**
 * Generates flashcards using the OpenAI API based on PDF content and user preferences
 */
export const generateFlashcards = async (options: FlashcardGenerationOptions): Promise<FlashcardSet> => {
  try {
    console.log('Generating flashcards with options:', options);
    
    // Log generation attempt
    console.log('Attempting to generate flashcards with AI service');
    
    // Extract PDF URLs from resources
    const pdfUrls = options.resources.map(resource => resource.fileUrl);
    
    if (pdfUrls.length === 0) {
      throw new Error('No PDF resources found for the selected criteria');
    }
    
    // Create the system prompt
    const systemPrompt = createSystemPrompt(options);
    
    // Create the user prompt with PDF URLs
    const userPrompt = createUserPrompt(options, pdfUrls);
    
    // Call AI service (OpenAI with Gemini fallback)
    console.log('Calling AI service for flashcards generation...');
    const content = await generateContent(systemPrompt, userPrompt);
    
    console.log('AI service response received successfully');
    
    // Parse the response into a FlashcardSet
    const flashcardSet = parseOpenAIResponse(content, options);
    
    // Log the successful generation
    console.log(`Successfully generated ${flashcardSet.flashcards.length} flashcards for ${options.subject}`);
    
    return flashcardSet;
    
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
};

/**
 * Creates the system prompt for the OpenAI API
 */
function createSystemPrompt(options: FlashcardGenerationOptions): string {
  return `You are a helpful AI assistant that creates educational flashcards. Your task is to generate a set of flashcards based on the provided PDF content and user preferences.

The flashcards should be:
1. Clear and concise
2. Focused on key concepts and learning objectives
3. Appropriate for the specified class level and subject
4. Following the specified flashcard type format

Please format your response as a JSON object with the following structure:
{
  "title": "Descriptive title for the flashcard set",
  "class": "The class level",
  "subject": "The subject",
  "book": "The book name",
  "chapters": ["Array of chapter names"],
  "flashcards": [
    {
      "id": "unique-id",
      "front": "Content for the front of the card",
      "back": "Content for the back of the card",
      "type": "The type of flashcard",
      "tags": ["Optional array of relevant tags"]
    }
  ]
}`;
}

/**
 * Creates the user prompt for the OpenAI API
 */
function createUserPrompt(options: FlashcardGenerationOptions, pdfUrls: string[]): string {
  return `Please create a set of flashcards with the following specifications:

Class: ${options.class}
Subject: ${options.subject}
Book: ${options.book}
Chapters: ${options.chapters.join(', ')}
Flashcard Type: ${options.flashcardType}

Additional Instructions: ${options.additionalInstructions || 'None'}

The content should be based on the following PDF resources:
${pdfUrls.map((url, index) => `${index + 1}. ${url}`).join('\n')}

Please ensure the flashcards are appropriate for the specified class level and follow the chosen flashcard type format.`;
}

/**
 * Parses the OpenAI API response into a FlashcardSet
 */
function parseOpenAIResponse(content: string, options: FlashcardGenerationOptions): FlashcardSet {
  try {
    // Parse the JSON response
    const parsedContent = JSON.parse(content);
    
    // Validate the required fields
    if (!parsedContent.title || !Array.isArray(parsedContent.flashcards)) {
      throw new Error('Invalid response format from OpenAI API');
    }
    
    // Create the FlashcardSet object
    const flashcardSet: FlashcardSet = {
      title: parsedContent.title,
      class: options.class,
      subject: options.subject,
      book: options.book,
      chapters: options.chapters,
      flashcards: parsedContent.flashcards.map((card: any, index: number) => ({
        id: card.id || `card-${index + 1}`,
        front: card.front,
        back: card.back,
        type: card.type || options.flashcardType,
        tags: card.tags || []
      }))
    };
    
    return flashcardSet;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse the generated flashcards');
  }
}
