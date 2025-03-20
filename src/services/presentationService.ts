import { Resource } from '../types/resource';

// Define the presentation types
export interface Slide {
  id: number;
  title: string;
  content: string[];
  visualDescription?: string;
  notes?: string;
}

export interface Presentation {
  title: string;
  subject: string;
  class: string;
  type: string;
  template: string;
  slides: Slide[];
  book?: string;
  chapters?: string[];
}

export interface PresentationGenerationOptions {
  class: string;
  subject: string;
  book?: string;
  chapters: string[];
  presentationType: string; // Now supports: 'Slide by Slide', 'Topic Wise', 'Chapter Wise', 'Unit Wise', 'Lesson Wise', 'Concept Wise', 'Question-Answer', 'Summary'
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
  return `You are an expert presentation designer specialized in creating educational slide decks from academic content. Your task is to analyze PDF documents and transform them into clear, engaging, and well-structured presentations based on user specifications.

WORKFLOW:
1. Analyze the provided content thoroughly
2. Structure the presentation according to the specified organization type
3. Create the requested number of slides
4. Apply the selected template style
5. Incorporate any additional instructions provided by the user

PRESENTATION TYPES:
- Slide by Slide: Create a detailed presentation with content broken down sequentially into individual slides
- Topic Wise: Organize content by specific topics within chapters, with each topic getting dedicated slide(s)
- Chapter Wise: Provide comprehensive overviews of entire chapters, with major points highlighted
- Unit Wise: Create broader coverage combining related chapters into cohesive units
- Lesson Wise: Develop focused content for individual lessons within chapters
- Concept Wise: Offer deep dives into specific concepts with detailed explanations

SLIDE CREATION GUIDELINES:
1. Each slide should have a clear title that communicates its main focus
2. Include detailed content with explanations - not just bullet point headings
3. Each bullet point should be informative and contain complete sentences or ideas
4. Include relevant visuals, diagrams, or charts where helpful
5. Maintain consistent formatting throughout the presentation
6. Ensure proper flow and logical transitions between slides
7. Add slide numbers and maintain consistent headers/footers if specified in the template
8. Include introduction and conclusion/summary slides

You must respond with a valid JSON object that follows this exact structure:
{
  "title": "Presentation Title",
  "slides": [
    {
      "id": 1,
      "title": "Slide Title",
      "content": [
        "Detailed bullet point 1 with complete information about the topic",
        "Thorough bullet point 2 explaining key concept with examples",
        "Comprehensive bullet point 3 with definitions and explanations"
      ],
      "visualDescription": "Detailed description of a recommended visual element for this slide, including what it should contain and how it relates to the content",
      "notes": "Extensive speaker notes with additional context, explanation, and talking points for this slide"
    },
    {
      "id": 2,
      "title": "Slide Title",
      "content": [
        "Detailed bullet point 1 with complete information about the topic",
        "Thorough bullet point 2 explaining key concept with examples",
        "Comprehensive bullet point 3 with definitions and explanations"
      ],
      "visualDescription": "Detailed description of a recommended visual element for this slide, including what it should contain and how it relates to the content",
      "notes": "Extensive speaker notes with additional context, explanation, and talking points for this slide"
    }
  ]
}

OUTPUT FORMAT:
Generate a complete presentation with:
1. Title slide (id: 1) including subject, chapter(s), and class level
2. Agenda/overview slide (id: 2) outlining the presentation structure
3. Content slides (ids: 3 to ${options.slideCount-1}) formatted according to the ${options.presentationType} presentation type
4. Summary/conclusion slide (id: ${options.slideCount}) with key takeaways
5. Any additional slides specified in the additional instructions

For each slide, you MUST provide:
- Clear, descriptive slide title
- Detailed content as comprehensive bullet points (not just brief headings)
- Thorough description of suggested visuals or diagrams to include
- Extensive speaker notes with additional context or explanation

Important guidelines:
1. Create exactly ${options.slideCount} slides.
2. Make the content educational, accurate, and engaging for ${options.class} students.
3. The presentation type is "${options.presentationType}" - structure the content accordingly.
4. For each slide, include:
   - Clear slide title
   - Detailed, informative bullet points (not just brief headings)
   - Thorough description of suggested visuals or diagrams
   - Comprehensive speaker notes with additional context
5. IMPORTANT: Your response must be ONLY the valid JSON object with no additional text or explanation.
6. Do not use any markdown formatting in your response.
7. Ensure the JSON is properly formatted and valid.
8. DO NOT include any text outside the JSON structure.
9. DO NOT include any explanation or preamble before the JSON.
10. DO NOT include any markdown code fences or JSON language indicators.

${options.additionalInstructions ? `Additional instructions: ${options.additionalInstructions}` : ''}`;
};

/**
 * Creates a user prompt for the OpenAI API with PDF URLs
 */
const createUserPrompt = (options: PresentationGenerationOptions, pdfUrls: string[]): string => {
  return `Create a detailed, educational presentation for ${options.class} class on ${options.subject}, focusing on the chapters: ${options.chapters.join(', ')}.

The presentation should follow the "${options.presentationType}" organizational structure with ${options.slideCount} slides using the "${options.designTemplate}" design template.

INPUT VARIABLES:
- Class: ${options.class}
- Subject: ${options.subject}
- Chapters: ${options.chapters.join(', ')}
- Presentation Type: ${options.presentationType}
- Number of Slides: ${options.slideCount}
- Template: ${options.designTemplate}
- Additional Instructions: ${options.additionalInstructions || 'None provided'}

${pdfUrls.length > 0 
  ? `Here are the resources that contain content to analyze:
${pdfUrls.map((url, index) => `Resource ${index + 1}: ${url}`).join('\n')}`
  : 'No specific resources are provided, so create content based on standard curriculum for this subject and class level.'}

SLIDE CONTENT REQUIREMENTS:
- Each bullet point must be detailed and informative, containing complete thoughts and explanations, not just brief headings
- Include definitions, examples, and thorough explanations in the content
- Each slide must include a comprehensive "visualDescription" field describing a relevant image, diagram, or visual element
- Visual descriptions should be detailed enough to guide an illustrator in creating the visual
- For complex topics, include specific diagrams or visual aids that clarify the concepts
- Speaker notes should be extensive and provide additional context beyond what's on the slide
- Ensure all content is age-appropriate for ${options.class} students

OUTPUT FORMAT REQUIREMENTS:
For each slide, you MUST provide:
1. Clear, descriptive slide title
2. Detailed, comprehensive bullet points with complete information
3. Thorough description of suggested visuals or diagrams
4. Extensive speaker notes with additional context and talking points

ADDITIONAL CAPABILITIES:
- Adapt language complexity based on the specified class level (${options.class})
- Highlight key terms, definitions, and concepts with thorough explanations
- Include suggestion for interactive elements or discussion questions when appropriate
- Structure content to support different learning styles
- Provide comprehensive examples that reinforce key concepts

REMEMBER:
1. Content must be educational, accurate, and engaging for ${options.class} students
2. Each bullet point must be detailed and contain complete information
3. Respond ONLY with a valid JSON object
4. The JSON must include the "visualDescription" field for each slide
5. Do not include any explanations or text outside the JSON
6. Do not use markdown code fences (like \`\`\`json)
7. The JSON must follow the exact structure specified in the system message`;
};

/**
 * Returns a description of the presentation type
 */
const getTypeDescription = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'slide by slide':
      return 'create a detailed presentation with content broken down sequentially into individual slides';
    case 'topic wise':
      return 'organize content by specific topics within chapters, with each topic getting dedicated slide(s)';
    case 'chapter wise':
      return 'provide comprehensive overviews of entire chapters, with major points highlighted';
    case 'unit wise':
      return 'create broader coverage combining related chapters into cohesive units';
    case 'lesson wise':
      return 'develop focused content for individual lessons within chapters';
    case 'concept wise':
      return 'offer deep dives into specific concepts with detailed explanations';
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
          book: options.book,
          type: options.presentationType,
          template: options.designTemplate,
          slides: directParse.slides,
          chapters: options.chapters
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
            book: options.book,
            type: options.presentationType,
            template: options.designTemplate,
            slides: parsedContent.slides,
            chapters: options.chapters
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
    title: `${options.subject}`,
    content: [
      `Class: ${options.class} - Educational content designed specifically for this academic level`,
      `Chapters: ${options.chapters.join(', ')} - Covering key concepts and learning objectives from these specific sections`,
      `Presentation Type: ${options.presentationType} - Structured to optimize learning according to this organizational approach`,
      'This is a fallback presentation due to API issues. Please try generating the presentation again for complete educational content.'
    ],
    visualDescription: "A professionally designed title slide featuring the subject name prominently displayed in the center with a complementary background color. Include the class level and chapter information below the title. Add a relevant educational image or icon representing the subject matter in the top right corner. The school/institution logo could be placed at the bottom of the slide.",
    notes: 'This is a fallback presentation created when the OpenAI API call failed. Consider trying again with different parameters. When presenting this slide, introduce yourself and give a brief overview of what the presentation will cover and why it is relevant to the students.'
  });
  
  // Add an agenda/overview slide
  slides.push({
    id: 2,
    title: 'Agenda and Learning Objectives',
    content: [
      'Introduction to the topic - We will begin with an overview of the subject matter and why it is important for your educational development',
      ...options.chapters.map(chapter => `Overview of ${chapter} - Covering the core concepts, definitions, and practical applications related to this chapter`),
      'Interactive discussions and activities - Throughout the presentation, we will engage in Q&A and activities to reinforce understanding',
      'Summary and key takeaways - We will conclude with a comprehensive review of the most important points and learning objectives'
    ],
    visualDescription: "A clear, organized flowchart or mind map that visually represents the presentation structure. Each major topic should be represented in a separate box or node, with connecting lines showing the flow and relationship between topics. Use a consistent color scheme that coordinates with the title slide, with different colors for different sections. Include small relevant icons next to each agenda item to add visual interest.",
    notes: 'This slide presents the agenda for the presentation. Explain to students how the presentation will flow and what they can expect to learn. Emphasize that questions are welcome and that there will be interactive elements throughout. Consider asking students what they already know about the topic to gauge prior knowledge.'
  });
  
  // Add slides for each chapter
  options.chapters.forEach((chapter, index) => {
    slides.push({
      id: index + 3,
      title: chapter,
      content: [
        `Key Concept 1: Detailed explanation of the first important concept from ${chapter}. This would include proper definitions, specific examples, and how this concept relates to the broader subject area. In a successful generation, this bullet point would contain complete educational content appropriate for ${options.class} students.`,
        `Key Concept 2: Comprehensive coverage of the second major concept, including its historical development, current understanding, and practical applications. This would be explained in age-appropriate language for ${options.class} students with relevant examples that connect to their existing knowledge.`,
        `Key Concept 3: Thorough explanation of the third significant concept with emphasis on how it connects to previously learned material. This would include examples, counterexamples, and common misconceptions to ensure complete understanding.`,
        `Discussion Question: Thought-provoking question related to the content that encourages critical thinking and application of the concepts just learned. For example: "How might these concepts apply to real-world situations you've encountered?"`
      ],
      visualDescription: "A detailed, educational diagram specifically illustrating the main concepts of this chapter. For Key Concept 1, include a labeled visual representation showing its components or process. For Key Concept 2, create a comparison chart or flowchart that demonstrates relationships or sequences. For Key Concept 3, incorporate a real-world example through an illustration or photograph with annotations. Use a color scheme consistent with the rest of the presentation, and ensure all text in the visual is large enough to be readable. Include a small legend if necessary to explain any symbols or color coding.",
      notes: `This slide covers the essential concepts from ${chapter}. Begin by connecting to previous knowledge, then introduce each concept one by one. For Key Concept 1, provide additional examples beyond what's on the slide. For Key Concept 2, consider asking students for their own examples before providing yours. For Key Concept 3, address common misconceptions that students at this level typically have. Allow time for questions after presenting each concept. End with the discussion question and give students time to think and respond.`
    });
  });
  
  // Add a conclusion slide
  slides.push({
    id: slides.length + 1,
    title: 'Summary and Conclusion',
    content: [
      'Review of key concepts covered: We have explored the fundamental concepts from each chapter, including [specific concepts tailored to the chapters]. These concepts form the foundation for further learning in this subject area.',
      'Important takeaways: The most critical points to remember are [would list specific takeaways relevant to the subject and chapters]. Understanding these points will help you succeed in future lessons and assessments.',
      'Next steps and learning objectives: Building on today\'s material, we will explore [related topics] next. To prepare, you can [specific suggestions for further study or practice].',
      'Discussion questions: What aspects of today\'s topic did you find most interesting? How might you apply these concepts in your own life or studies? What questions remain unanswered that you\'d like to explore further?'
    ],
    visualDescription: "A comprehensive summary infographic that ties together all the main concepts covered in the presentation. Design it as a visual mind map with the main subject in the center and branches extending to each key concept. Include small illustrations for each major point, and use a consistent color scheme to group related ideas. Add a section at the bottom for 'Next Steps' with visual representations of upcoming topics. Ensure all text is concise but informative. The overall design should feel cohesive and provide a visual review of the entire presentation content.",
    notes: 'For this final slide, review each key takeaway and ask students to share their own insights or questions. Emphasize how the material connects to their broader education and future lessons. Consider conducting a brief formative assessment through targeted questions to gauge understanding. Provide information about any homework or further resources for students who want to explore the topic more deeply. End by previewing what will be covered in the next lesson and how it builds on today\'s content.'
  });
  
  return {
    title: `${options.subject} - ${options.chapters.join(', ')}`,
    subject: options.subject,
    class: options.class,
    book: options.book,
    type: options.presentationType,
    template: options.designTemplate,
    slides,
    chapters: options.chapters
  };
};
