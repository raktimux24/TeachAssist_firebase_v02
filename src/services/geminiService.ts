import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const getGeminiClient = () => {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured in environment variables');
  }
  
  return new GoogleGenerativeAI(GEMINI_API_KEY);
};

/**
 * Generates content using the Gemini API
 * @param systemPrompt - The system prompt to guide the model
 * @param userPrompt - The user prompt with specific instructions
 * @returns The generated content as a string
 */
export const generateWithGemini = async (
  systemPrompt: string,
  userPrompt: string
): Promise<string> => {
  try {
    console.log('Generating content with Gemini API');
    
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Combine system and user prompts for Gemini
    // Since Gemini doesn't have a separate system prompt concept like OpenAI
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    console.log('Combined prompt for Gemini:', combinedPrompt);
    
    // Generate content
    const result = await model.generateContent(combinedPrompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Gemini API response received successfully');
    
    return text;
  } catch (error) {
    console.error('Error generating content with Gemini API:', error);
    throw error;
  }
};

/**
 * Check if the Gemini API is available and configured
 * @returns True if the API is available, false otherwise
 */
export const isGeminiAvailable = (): boolean => {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  return !!GEMINI_API_KEY;
};
