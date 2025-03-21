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
    
    // Add JSON formatting instructions to the system prompt
    const enhancedSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Your response MUST be in valid JSON format. Do not include any text outside of the JSON object. The JSON should include a 'title' field and a 'questions' array with each question having 'id', 'type', 'question', 'options' (for MCQs), 'answer', and 'explanation' fields.`;
    
    // Combine system and user prompts for Gemini
    // Since Gemini doesn't have a separate system prompt concept like OpenAI
    const combinedPrompt = `${enhancedSystemPrompt}\n\n${userPrompt}`;
    
    console.log('Combined prompt for Gemini:', combinedPrompt);
    
    // Generate content with specific generation config to encourage JSON output
    const generationConfig = {
      temperature: 0.2, // Lower temperature for more deterministic output
      topP: 0.8,
      topK: 40,
    };
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
      generationConfig,
    });
    
    const response = result.response;
    let text = response.text();
    
    // Try to ensure the response is valid JSON
    try {
      // Check if the response starts with a code block marker
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      // Validate that it's parseable JSON
      JSON.parse(text);
      console.log('Gemini API response is valid JSON');
    } catch (jsonError) {
      console.warn('Gemini response is not valid JSON, attempting to fix:', jsonError);
      
      // Try to extract JSON from the text if it's embedded in other content
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
        try {
          JSON.parse(text); // Validate the extracted JSON
          console.log('Successfully extracted JSON from Gemini response');
        } catch (extractError) {
          console.error('Failed to extract valid JSON from Gemini response');
        }
      }
    }
    
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
