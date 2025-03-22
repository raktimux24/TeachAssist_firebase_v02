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
    responseFormat = { type: 'json_object' } // Force JSON response format
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
    try {
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
        let errorData: any = {};
        try {
          errorData = await response.json();
          console.error('OpenAI API error:', JSON.stringify(errorData));
        } catch (jsonError) {
          console.error('Failed to parse OpenAI error response as JSON:', jsonError);
          const errorText = await response.text();
          console.error('OpenAI API error text:', errorText);
          errorData = { error: { message: `HTTP error ${response.status}: ${errorText}` } };
        }
        
        // Check for billing issues
        const isBillingIssue = 
          errorData.error?.type === 'billing_not_active' || 
          errorData.error?.code === 'billing_not_active' ||
          (errorData.error?.message && (errorData.error.message.includes('billing') || 
                                      errorData.error.message.includes('account is not active')));
        
        if (isBillingIssue) {
          console.warn('OpenAI API billing issue detected, falling back to Gemini API...');
          
          // Try Gemini as fallback if available
          if (isGeminiAvailable()) {
            console.log('Falling back to Gemini API...');
            try {
              // Clear the error from console to avoid confusion
              console.clear();
              console.log('Using Gemini API due to OpenAI billing issues');
              return await generateWithGemini(systemPrompt, userPrompt);
            } catch (geminiError) {
              console.error('Gemini API fallback failed after OpenAI billing issue:', geminiError);
              throw new Error(`Gemini API fallback failed after OpenAI billing issue: ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`);
            }
          } else {
            console.error('Gemini API not available for fallback (no API key configured)');
          }
        }
        
        // For non-billing issues, still try Gemini as fallback if available
        if (isGeminiAvailable()) {
          console.log('Falling back to Gemini API for non-billing error...');
          try {
            // Clear the error from console to avoid confusion
            console.clear();
            console.log('Using Gemini API due to OpenAI API errors');
            return await generateWithGemini(systemPrompt, userPrompt);
          } catch (geminiError) {
            console.error('Gemini API fallback also failed:', geminiError);
            throw new Error(`Both OpenAI and Gemini APIs failed. OpenAI error: ${errorData.error?.message || 'Unknown error'}. Gemini error: ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`);
          }
        }
        
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      try {
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (jsonError) {
        console.error('Failed to parse OpenAI success response as JSON:', jsonError);
        throw new Error('Failed to parse OpenAI response');
      }
    } catch (fetchError) {
      console.error('Fetch error when calling OpenAI API:', fetchError);
      
      // Try Gemini as fallback for network errors
      if (isGeminiAvailable()) {
        console.log('Network error with OpenAI, falling back to Gemini API...');
        try {
          // Clear the error from console to avoid confusion
          console.clear();
          console.log('Using Gemini API due to OpenAI network errors');
          return await generateWithGemini(systemPrompt, userPrompt);
        } catch (geminiError) {
          console.error('Gemini API fallback also failed:', geminiError);
          throw new Error(`Network error with OpenAI and Gemini fallback failed. Error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        }
      }
      
      throw fetchError;
    }

    // This code is now handled inside the try/catch block above
  } catch (error) {
    console.error('Error in content generation:', error);
    
    // Try Gemini as fallback if not already tried
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for billing issues in the error message
    const isBillingIssue = 
      errorMessage.includes('billing') || 
      errorMessage.includes('account is not active');
    
    if (isBillingIssue) {
      console.warn('OpenAI API billing issue detected in error, falling back to Gemini API...');
      
      // Only try Gemini if it's available and the error isn't already from Gemini
      if (isGeminiAvailable() && !errorMessage.includes('Gemini API')) {
        console.log('Attempting Gemini API as fallback for billing issue...');
        try {
          // Clear the error from console to avoid confusion
          console.clear();
          console.log('Using Gemini API due to OpenAI billing issues');
          return await generateWithGemini(systemPrompt, userPrompt);
        } catch (geminiError) {
          const geminiErrorMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
          console.error('Gemini API fallback also failed:', geminiErrorMsg);
          throw new Error(`Both OpenAI (billing issue) and Gemini APIs failed. Gemini error: ${geminiErrorMsg}`);
        }
      } else if (!isGeminiAvailable()) {
        console.error('Gemini API not available for fallback (no API key configured)');
        throw new Error('OpenAI API has billing issues and Gemini API is not configured. Please check your API keys.');
      }
    }
    
    // For non-billing issues, still try Gemini as fallback if not already from Gemini
    if (errorMessage !== 'No API keys configured for either OpenAI or Gemini' && 
        !errorMessage.includes('Gemini API') && 
        isGeminiAvailable()) {
      console.log('Error with OpenAI, falling back to Gemini API...');
      try {
        // Clear the error from console to avoid confusion
        console.clear();
        console.log('Using Gemini API due to OpenAI errors');
        return await generateWithGemini(systemPrompt, userPrompt);
      } catch (geminiError) {
        const geminiErrorMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
        console.error('Gemini API fallback also failed:', geminiErrorMsg);
        throw new Error(`Both OpenAI and Gemini APIs failed. OpenAI error: ${errorMessage}. Gemini error: ${geminiErrorMsg}`);
      }
    }
    
    throw error;
  }
};
