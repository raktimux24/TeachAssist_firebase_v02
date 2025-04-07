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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp-01-21' });
    
    // Detect if this is for notes generation or question sets
    const isQuestionSet = userPrompt.includes('question set') || systemPrompt.includes('question set');
    const isNotes = userPrompt.includes('class notes') || systemPrompt.includes('class notes');
    
    // Add appropriate JSON formatting instructions based on content type
    let enhancedSystemPrompt = systemPrompt;
    
    if (isQuestionSet) {
      enhancedSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Your response MUST be in valid JSON format. Do not include any text outside of the JSON object. The JSON should include a 'title' field and a 'questions' array with each question having 'id', 'type', 'question', 'options' (for MCQs), 'answer', and 'explanation' fields.`;
    } else if (isNotes) {
      enhancedSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Your response MUST be in valid JSON format. Do not include any text outside of the JSON object. The JSON should include 'title', 'subject', 'class', 'chapters', 'type', 'layout', and 'notes' fields. The 'notes' field should be an array of objects, each with 'id', 'title', and 'content' fields.`;
    } else {
      enhancedSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Your response MUST be in valid JSON format. Do not include any text outside of the JSON object.`;
    }
    
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
          
          // If this is notes content and we still can't parse it, create a simple JSON structure
          if (isNotes) {
            console.log('Creating fallback JSON structure for notes');
            const titleMatch = text.match(/title["']?\s*:\s*["']([^"']+)["']/);
            const title = titleMatch ? titleMatch[1] : 'Generated Notes';
            
            // Create a simple JSON structure with the raw content
            const subjectMatch = userPrompt.match(/subject:\s*([^\n]+)/);
            const classMatch = userPrompt.match(/class:\s*([^\n]+)/);
            
            text = JSON.stringify({
              title: title,
              subject: subjectMatch ? subjectMatch[1] : '',
              class: classMatch ? classMatch[1] : '',
              chapters: [],
              type: 'comprehensive',
              layout: 'one-column',
              notes: [{
                id: '1',
                title: 'Generated Content',
                content: text.replace(/```/g, '').trim()
              }]
            });
            console.log('Created fallback JSON structure for notes');
          } else if (isQuestionSet) {
            console.log('Creating fallback JSON structure for question set');
            const titleMatch = text.match(/title["']?\s*:\s*["']([^"']+)["']/);
            const title = titleMatch ? titleMatch[1] : 'Generated Question Set';
            
            // Extract subject and class from the user prompt
            const subjectMatch = userPrompt.match(/subject:\s*([^\n]+)/);
            const classMatch = userPrompt.match(/class:\s*([^\n]+)/);
            
            // Try to extract questions from the raw text
            const questions = [];
            
            // Look for numbered questions (e.g., "1. What is...", "Question 1: What is...")
            const questionMatches = text.match(/(?:^|\n)(?:Question\s*)?\d+[.:]\s*([^\n]+)/g) || [];
            
            if (questionMatches.length > 0) {
              questionMatches.forEach((q, index) => {
                const questionText = q.replace(/(?:^|\n)(?:Question\s*)?\d+[.:]\s*/, '').trim();
                questions.push({
                  id: (index + 1).toString(),
                  type: 'short_answer',
                  question: questionText,
                  answer: 'Answer not available',
                  explanation: 'Explanation not available'
                });
              });
            } else {
              // If no questions found, create a default question
              questions.push({
                id: '1',
                type: 'short_answer',
                question: 'Default question',
                answer: 'Answer not available',
                explanation: 'Explanation not available'
              });
            }
            
            text = JSON.stringify({
              title: title,
              subject: subjectMatch ? subjectMatch[1] : '',
              class: classMatch ? classMatch[1] : '',
              chapters: [],
              difficulty: 'medium',
              includeAnswers: true,
              questions: questions
            });
            console.log('Created fallback JSON structure for question set');
          }
        }
      } else if (isNotes) {
        // If no JSON found and this is notes content, create a simple JSON structure
        console.log('No JSON found, creating fallback JSON structure for notes');
        const subjectMatch = userPrompt.match(/subject:\s*([^\n]+)/);
        const classMatch = userPrompt.match(/class:\s*([^\n]+)/);
        
        text = JSON.stringify({
          title: 'Generated Notes',
          subject: subjectMatch ? subjectMatch[1] : '',
          class: classMatch ? classMatch[1] : '',
          chapters: [],
          type: 'comprehensive',
          layout: 'one-column',
          notes: [{
            id: '1',
            title: 'Generated Content',
            content: text.replace(/```/g, '').trim()
          }]
        });
        console.log('Created fallback JSON structure for notes');
      } else if (isQuestionSet) {
        // If no JSON found and this is question set content, create a simple JSON structure
        console.log('No JSON found, creating fallback JSON structure for question set');
        const subjectMatch = userPrompt.match(/subject:\s*([^\n]+)/);
        const classMatch = userPrompt.match(/class:\s*([^\n]+)/);
        
        // Try to extract questions from the raw text
        const questions = [];
        
        // Look for numbered questions (e.g., "1. What is...", "Question 1: What is...")
        const questionMatches = text.match(/(?:^|\n)(?:Question\s*)?\d+[.:]\s*([^\n]+)/g) || [];
        
        if (questionMatches.length > 0) {
          questionMatches.forEach((q, index) => {
            const questionText = q.replace(/(?:^|\n)(?:Question\s*)?\d+[.:]\s*/, '').trim();
            questions.push({
              id: (index + 1).toString(),
              type: 'short_answer',
              question: questionText,
              answer: 'Answer not available',
              explanation: 'Explanation not available'
            });
          });
        } else {
          // If no questions found, create a default question
          questions.push({
            id: '1',
            type: 'short_answer',
            question: 'Default question',
            answer: 'Answer not available',
            explanation: 'Explanation not available'
          });
        }
        
        text = JSON.stringify({
          title: 'Generated Question Set',
          subject: subjectMatch ? subjectMatch[1] : '',
          class: classMatch ? classMatch[1] : '',
          chapters: [],
          difficulty: 'medium',
          includeAnswers: true,
          questions: questions
        });
        console.log('Created fallback JSON structure for question set');
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
