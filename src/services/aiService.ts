import { isGeminiAvailable, generateWithGemini } from './geminiService';

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generate content using OpenAI API with Gemini fallback
 * @param systemPrompt - The system prompt to guide the model
 * @param userPrompt - The user prompt with specific instructions
 * @param options - Additional options for the API call
 * @returns The generated content as a string
 */
export const generateContent = async (
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: string };
  } = {}
): Promise<string> => {
  // Default options
  const {
    model = 'gpt-4-turbo',
    temperature = 0.7,
    maxTokens = 4000,
    responseFormat = undefined
  } = options;

  try {
    // Try OpenAI first
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.log('OpenAI API key not found, trying Gemini...');
      if (isGeminiAvailable()) {
        return await generateWithGemini(systemPrompt, userPrompt);
      }
      throw new Error('No API keys configured for either OpenAI or Gemini');
    }

    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens,
        ...(responseFormat ? { response_format: responseFormat } : {})
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      
      // Try Gemini as fallback if available
      if (isGeminiAvailable()) {
        console.log('Falling back to Gemini API...');
        return await generateWithGemini(systemPrompt, userPrompt);
      }
      
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in content generation:', error);
    
    // Try Gemini as fallback if not already tried
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage !== 'No API keys configured for either OpenAI or Gemini' && 
        !errorMessage.includes('Gemini API') && 
        isGeminiAvailable()) {
      console.log('Error with OpenAI, falling back to Gemini API...');
      return await generateWithGemini(systemPrompt, userPrompt);
    }
    
    throw error;
  }
};
