import { Resource } from '../types/resource';

// Define the presentation types
export interface Slide {
  id: number;
  title: string;
  content: string[];
  notes?: string;
}

export interface Presentation {
  title: string;
  subject: string;
  class: string;
  type: string;
  template: string;
  slides: Slide[];
}

export interface PresentationGenerationOptions {
  class: string;
  subject: string;
  chapters: string[];
  presentationType: string;
  slideCount: number;
  designTemplate: string;
  additionalInstructions: string;
  resources: Resource[];
}

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const IS_PROJECT_KEY = OPENAI_API_KEY?.startsWith('sk-proj-');
const DEFAULT_MODEL = IS_PROJECT_KEY ? 'gpt-3.5-turbo' : 'gpt-4-turbo';

// Debug function to test OpenAI API connectivity
export const testOpenAIConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing OpenAI API connection...');
    console.log('API Key available:', OPENAI_API_KEY ? 'Yes (length: ' + OPENAI_API_KEY.length + ')' : 'No');
    console.log('API Key type:', IS_PROJECT_KEY ? 'Project API Key' : 'Standard API Key');
    console.log('Using model:', DEFAULT_MODEL);
    
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is missing from environment variables');
      return false;
    }
    
    // Simple test request
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello, this is a test message to verify API connectivity.' }
        ],
        max_tokens: 50
      })
    });
    
    console.log('Test API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API test error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('OpenAI API test error details:', errorData);
      } catch (parseError) {
        console.error('Failed to parse error response as JSON');
      }
      
      return false;
    }
    
    const data = await response.json();
    console.log('OpenAI API test successful!');
    console.log('Response:', data.choices[0].message.content);
    return true;
    
  } catch (error) {
    console.error('Error testing OpenAI connection:', error);
    return false;
  }
};

/**
 * Generates presentation slides using the OpenAI API based on PDF content and user preferences
 */
export const generatePresentation = async (options: PresentationGenerationOptions): Promise<Presentation> => {
  try {
    console.log('Generating presentation with options:', options);
    
    // Verify API key is available
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is missing from environment variables');
      throw new Error('OpenAI API key is not configured in environment variables');
    }
    
    console.log('OpenAI API Key available:', OPENAI_API_KEY ? `Yes (length: ${OPENAI_API_KEY.length})` : 'No');
    console.log('API Key type:', IS_PROJECT_KEY ? 'Project API Key' : 'Standard API Key');
    console.log('Using model:', DEFAULT_MODEL);
    
    // Extract PDF URLs from resources
    const pdfUrls = options.resources.map(resource => resource.fileUrl);
    
    console.log(`Found ${pdfUrls.length} resources for the selected criteria`);
    
    // Create the system prompt
    const systemPrompt = createSystemPrompt(options);
    console.log('System prompt:', systemPrompt);
    
    // Create the user prompt with PDF URLs
    const userPrompt = createUserPrompt(options, pdfUrls);
    console.log('User prompt:', userPrompt);
    
    console.log('Sending request to OpenAI API...');
    
    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" } // Explicitly request JSON response format
      })
    });
    
    console.log('OpenAI API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response text:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText || 'Unknown error'}`);
      } catch (parseError) {
        console.error('Failed to parse error response as JSON:', parseError);
        throw new Error(`OpenAI API error: ${response.statusText || 'Unknown error'} (Status: ${response.status})`);
      }
    }
    
    const responseText = await response.text();
    console.log('OpenAI API raw response received (first 100 chars):', responseText.substring(0, 100) + '...');
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response JSON:', parseError);
      console.error('Raw response that failed to parse (first 500 chars):', responseText.substring(0, 500) + '...');
      throw new Error('Failed to parse OpenAI API response as JSON');
    }
    
    console.log('OpenAI API parsed response structure:', Object.keys(data));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Unexpected response structure from OpenAI API:', data);
      throw new Error('Unexpected response structure from OpenAI API');
    }
    
    const content = data.choices[0].message.content;
    console.log('OpenAI response content (first 100 chars):', content.substring(0, 100) + '...');
    
    // Parse the response into a Presentation
    const presentation = parseOpenAIResponse(content, options);
    
    // Log the successful generation
    console.log(`Successfully generated ${presentation.slides.length} slides for ${options.subject}`);
    
    return presentation;
  } catch (error) {
    console.error('Error generating presentation:', error);
    
    // Create a fallback presentation
    console.log('Using fallback presentation due to error');
    return createFallbackPresentation(options);
  }
};

/**
 * Creates a system prompt for the OpenAI API
 */
const createSystemPrompt = (options: PresentationGenerationOptions): string => {
  return `You are an expert educational content creator specializing in creating presentation slides for teachers. 
You will create a presentation for ${options.class} class on ${options.subject}, focusing on the chapters: ${options.chapters.join(', ')}.

You must respond with a valid JSON object that follows this exact structure:
{
  "title": "Presentation Title",
  "slides": [
    {
      "id": 1,
      "title": "Slide Title",
      "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "notes": "Speaker notes for this slide"
    },
    {
      "id": 2,
      "title": "Slide Title",
      "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "notes": "Speaker notes for this slide"
    }
  ]
}

Important guidelines:
1. Create exactly ${options.slideCount} slides.
2. Make the content educational, accurate, and engaging for ${options.class} students.
3. The presentation type is "${options.presentationType}" which means ${getTypeDescription(options.presentationType)}.
4. Each slide should have a clear title and 3-5 bullet points of content.
5. Include brief speaker notes for each slide to guide the teacher.
6. IMPORTANT: Your response must be ONLY the valid JSON object with no additional text or explanation.
7. Do not use any markdown formatting in your response.
8. Ensure the JSON is properly formatted and valid.
9. DO NOT include any text outside the JSON structure.
10. DO NOT include any explanation or preamble before the JSON.
11. DO NOT include any markdown code fences or JSON language indicators.

${options.additionalInstructions ? `Additional instructions: ${options.additionalInstructions}` : ''}`;
};

/**
 * Creates a user prompt for the OpenAI API with PDF URLs
 */
const createUserPrompt = (options: PresentationGenerationOptions, pdfUrls: string[]): string => {
  return `Create a presentation for ${options.class} class on ${options.subject}, focusing on the chapters: ${options.chapters.join(', ')}.

The presentation should be in the "${options.presentationType}" format with ${options.slideCount} slides using the "${options.designTemplate}" design template.

${pdfUrls.length > 0 
  ? `Here are the resources that contain content (mentioned for context only):
${pdfUrls.map((url, index) => `Resource ${index + 1}: ${url}`).join('\n')}`
  : 'No specific resources are provided, so create content based on standard curriculum for this subject and class level.'}

REMEMBER:
1. Respond ONLY with a valid JSON object.
2. Do not include any explanations or text outside the JSON.
3. Do not use markdown code fences (like \`\`\`json).
4. The JSON must follow the exact structure specified in the system message.
5. Create educational content appropriate for ${options.class} class students studying ${options.subject}.`;
};

/**
 * Returns a description of the presentation type
 */
const getTypeDescription = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'topic-wise':
      return 'organize content by topics, with each slide focusing on a specific concept';
    case 'chapter-wise':
      return 'organize content by chapters, following the structure of the textbook';
    case 'question-answer':
      return 'present content in a question and answer format to facilitate learning';
    case 'summary':
      return 'provide a concise summary of the key points from the chapters';
    default:
      return 'organize content in a logical and educational manner';
  }
};

/**
 * Parses the OpenAI API response into a Presentation object
 */
const parseOpenAIResponse = (content: string, options: PresentationGenerationOptions): Presentation => {
  console.log('Parsing OpenAI response...');
  
  try {
    // First try direct parsing - the response might already be JSON
    try {
      console.log('Attempting direct JSON parse...');
      const directParse = JSON.parse(content);
      console.log('Direct JSON parse successful');
      
      // Validate the parsed object has the expected structure
      if (directParse.title && directParse.slides && Array.isArray(directParse.slides)) {
        console.log('Parsed object has valid structure');
        return {
          title: directParse.title,
          subject: options.subject,
          class: options.class,
          type: options.presentationType,
          template: options.designTemplate,
          slides: directParse.slides
        };
      } else {
        console.warn('Parsed object missing required fields, trying to extract JSON...');
      }
    } catch (directParseError) {
      console.warn('Direct JSON parse failed, trying to extract JSON from text:', directParseError);
    }
    
    // If direct parsing fails, try to extract JSON from the text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('Found JSON-like content in the response');
      const jsonContent = jsonMatch[0];
      
      try {
        const parsedContent = JSON.parse(jsonContent);
        console.log('Successfully parsed extracted JSON');
        
        // Validate the parsed object has the expected structure
        if (parsedContent.title && parsedContent.slides && Array.isArray(parsedContent.slides)) {
          console.log('Extracted JSON has valid structure');
          return {
            title: parsedContent.title,
            subject: options.subject,
            class: options.class,
            type: options.presentationType,
            template: options.designTemplate,
            slides: parsedContent.slides
          };
        } else {
          console.error('Extracted JSON missing required fields:', parsedContent);
          throw new Error('Parsed content missing required fields');
        }
      } catch (parseError) {
        console.error('Error parsing extracted JSON:', parseError);
        throw new Error('Failed to parse extracted JSON content');
      }
    } else {
      console.error('No JSON-like content found in the response');
      throw new Error('No JSON content found in the OpenAI response');
    }
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    return createFallbackPresentation(options);
  }
};

/**
 * Creates a fallback presentation when the API call or parsing fails
 */
const createFallbackPresentation = (options: PresentationGenerationOptions): Presentation => {
  console.log('Creating fallback presentation for:', options.subject);
  
  const slides: Slide[] = [];
  
  // Add a title slide
  slides.push({
    id: 1,
    title: `Introduction to ${options.subject}`,
    content: [
      `Welcome to ${options.class} ${options.subject}`,
      `Chapters: ${options.chapters.join(', ')}`,
      'This is a fallback presentation due to API issues'
    ],
    notes: 'This is a fallback presentation created when the OpenAI API call failed.'
  });
  
  // Add slides for each chapter
  options.chapters.forEach((chapter, index) => {
    slides.push({
      id: index + 2,
      title: chapter,
      content: [
        'Key Concept 1',
        'Key Concept 2',
        'Key Concept 3',
        'Please try generating the presentation again'
      ],
      notes: `This is a placeholder slide for chapter: ${chapter}`
    });
  });
  
  // Add a conclusion slide
  slides.push({
    id: slides.length + 1,
    title: 'Summary',
    content: [
      'Review of key concepts',
      'Important takeaways',
      'Next steps'
    ],
    notes: 'This is a placeholder summary slide.'
  });
  
  return {
    title: `${options.subject} - ${options.chapters.join(', ')}`,
    subject: options.subject,
    class: options.class,
    type: options.presentationType,
    template: options.designTemplate,
    slides
  };
};
