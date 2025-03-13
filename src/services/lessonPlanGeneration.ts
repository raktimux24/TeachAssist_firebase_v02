import { Resource } from '../types/resource';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, DocumentReference, query, where, orderBy, getDocs } from 'firebase/firestore';

export interface LessonPlanSection {
  id: string;
  title: string;
  content: string;
}

export interface LessonPlan {
  title: string;
  subject: string;
  class: string;
  chapters: string[];
  format: 'general' | 'subject-specific';
  numberOfClasses: number;
  learningObjectives?: string; // Optional learning objectives
  requiredResources?: string; // Optional required resources
  sections: LessonPlanSection[];
  createdAt: Date;
  userId?: string; // Optional user ID for associating lesson plans with a user
  firebaseId?: string; // Optional Firestore document ID
}

export interface LessonPlanGenerationOptions {
  class: string;
  subject: string;
  chapters: string[];
  title?: string; // Optional title property
  format: 'general' | 'subject-specific';
  numberOfClasses: number;
  learningObjectives: string;
  requiredResources: string;
  resources: Resource[];
  userId?: string; // Optional user ID for associating lesson plans with a user
}

// OpenAI API configuration - use environment variable
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generates lesson plans using the OpenAI API based on PDF content and user preferences
 * and saves them to Firestore
 */
export const generateLessonPlan = async (options: LessonPlanGenerationOptions): Promise<LessonPlan> => {
  try {
    console.log('Generating lesson plan with options:', options);
    
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
    
    console.log('System prompt:', systemPrompt);
    console.log('User prompt:', userPrompt);
    
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
    
    console.log('Raw OpenAI response:', content);
    
    // Parse the response into a LessonPlan
    const lessonPlan = parseOpenAIResponse(content, options);
    
    // Add the user ID if provided
    if (options.userId) {
      lessonPlan.userId = options.userId;
    }
    
    // Save to Firestore
    const firestoreDocRef = await saveLessonPlanToFirestore(lessonPlan, systemPrompt, userPrompt);
    
    // Add the Firestore document ID to the lesson plan
    if (firestoreDocRef) {
      lessonPlan.firebaseId = firestoreDocRef.id;
    }
    
    // Log the successful generation
    console.log(`Successfully generated lesson plan for ${options.subject} - ${options.chapters.join(', ')}`);
    console.log('Generated lesson plan:', lessonPlan);
    
    return lessonPlan;
    
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    throw error;
  }
};

/**
 * Saves the generated lesson plan to Firestore
 */
export const saveLessonPlanToFirestore = async (
  lessonPlan: LessonPlan, 
  systemPrompt?: string, 
  userPrompt?: string
): Promise<DocumentReference | null> => {
  try {
    // Create a Firestore-friendly version of the lesson plan
    // Convert Date objects to Firestore Timestamps
    const firestoreLessonPlan = {
      title: lessonPlan.title,
      subject: lessonPlan.subject,
      class: lessonPlan.class,
      chapters: lessonPlan.chapters,
      format: lessonPlan.format,
      numberOfClasses: lessonPlan.numberOfClasses,
      learningObjectives: lessonPlan.learningObjectives,
      requiredResources: lessonPlan.requiredResources,
      sections: lessonPlan.sections,
      userId: lessonPlan.userId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Save the OpenAI API request data
      apiRequestData: {
        systemPrompt: systemPrompt || '',
        userPrompt: userPrompt || ''
      }
    };
    
    // Add to the lessonplan collection (renamed from lessonplans)
    const docRef = await addDoc(collection(db, 'lessonplan'), firestoreLessonPlan);
    console.log('Lesson plan saved to Firestore with ID:', docRef.id);
    
    return docRef;
  } catch (error) {
    console.error('Error saving lesson plan to Firestore:', error);
    return null;
  }
};

/**
 * Retrieves all lesson plans for a specific user from Firestore
 */
export const getUserLessonPlans = async (userId: string): Promise<LessonPlan[]> => {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch lesson plans');
    }
    
    // Create a query to get all lesson plans for this user
    const q = query(
      collection(db, 'lessonplan'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    // Execute the query
    const querySnapshot = await getDocs(q);
    
    // Convert the query results to LessonPlan objects
    const lessonPlans: LessonPlan[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      const createdAt = data.createdAt?.toDate() || new Date();
      
      // Create a LessonPlan object from the document data
      const lessonPlan: LessonPlan = {
        title: data.title || '',
        subject: data.subject || '',
        class: data.class || '',
        chapters: data.chapters || [],
        format: data.format || 'general',
        numberOfClasses: data.numberOfClasses || 1,
        learningObjectives: data.learningObjectives,
        requiredResources: data.requiredResources,
        sections: data.sections || [],
        createdAt: createdAt,
        userId: data.userId,
        firebaseId: doc.id
      };
      
      lessonPlans.push(lessonPlan);
    });
    
    console.log(`Retrieved ${lessonPlans.length} lesson plans for user ${userId}`);
    return lessonPlans;
    
  } catch (error) {
    console.error('Error retrieving lesson plans:', error);
    return [];
  }
};

/**
 * Creates the system prompt for the OpenAI API
 */
const createSystemPrompt = (options: LessonPlanGenerationOptions): string => {
  const formatDescription = getFormatDescription(options.format);
  
  return `You are an expert educational content creator specializing in creating high-quality lesson plans for teachers.
Your task is to generate a comprehensive lesson plan based on the PDF content that will be provided.
The lesson plan should be tailored for ${options.class} teachers teaching ${options.subject}.

The lesson plan should follow the "${formatDescription}" approach and be designed for ${options.numberOfClasses} class period(s).

${options.learningObjectives ? `Learning Objectives: ${options.learningObjectives}` : ''}
${options.requiredResources ? `Required Resources: ${options.requiredResources}` : ''}

${getFormatGuidance()}

Format your response as a JSON object with the following structure:
{
  "title": "Lesson Plan title",
  "subject": "${options.subject}",
  "class": "${options.class}",
  "chapters": [${options.chapters.map(chapter => `"${chapter}"`).join(', ')}],
  "format": "${options.format}",
  "numberOfClasses": ${options.numberOfClasses},
  "learningObjectives": "${options.learningObjectives}",
  "requiredResources": "${options.requiredResources}",
  "sections": [
    {
      "id": "1",
      "title": "Section title",
      "content": "Content of the section with appropriate markdown formatting"
    },
    ...more sections
  ]
}

Important formatting guidelines:
1. Use proper markdown formatting for the content field in each section
2. For headings, use # for main headings, ## for subheadings, etc.
3. For lists, use - or * for bullet points, and 1. 2. 3. for numbered lists
4. For emphasis, use *italic* or **bold**
5. For code or formulas, use \`inline code\` or \`\`\`code blocks\`\`\`
6. For tables, use markdown table syntax
7. Ensure the content is comprehensive, clear, and educationally valuable

IMPORTANT: Your response must be a valid JSON object without any additional text before or after it.`;
};

/**
 * Creates the user prompt for the OpenAI API
 */
const createUserPrompt = (options: LessonPlanGenerationOptions, pdfUrls: string[]): string => {
  return `Please create a lesson plan for ${options.class} ${options.subject} covering the following chapters: ${options.chapters.join(', ')}.
  
The content is available in the following PDF files:
${pdfUrls.map(url => `- ${url}`).join('\n')}

You need to parse these PDFs and extract the relevant information to create a lesson plan according to my requirements.
Please make sure the lesson plan is accurate, comprehensive, and follows educational best practices.

Remember to format your response as a valid JSON object with the structure I specified.`;
};

/**
 * Parses the OpenAI API response into a LessonPlan
 */
const parseOpenAIResponse = (content: string, options: LessonPlanGenerationOptions): LessonPlan => {
  try {
    // Try to parse the JSON response
    let parsedContent: LessonPlan | null = null;
    
    // First try direct JSON parsing
    try {
      parsedContent = JSON.parse(content);
      console.log('Successfully parsed JSON directly');
    } catch (directParseError) {
      console.error('Direct JSON parsing failed:', directParseError);
      
      // Try to extract JSON from the response using regex
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonContent = jsonMatch[0];
          parsedContent = JSON.parse(jsonContent);
          console.log('Successfully parsed JSON using regex extraction');
        } else {
          console.error('No JSON object found in the response');
        }
      } catch (regexParseError) {
        console.error('Regex JSON parsing failed:', regexParseError);
      }
    }
    
    // If we successfully parsed the content, validate and return it
    if (parsedContent) {
      // Ensure all required fields are present
      if (!parsedContent.title) {
        parsedContent.title = `${options.subject} - ${options.chapters.join(', ')} Lesson Plan`;
      }
      
      if (!parsedContent.subject) {
        parsedContent.subject = options.subject;
      }
      
      if (!parsedContent.class) {
        parsedContent.class = options.class;
      }
      
      if (!parsedContent.chapters || !Array.isArray(parsedContent.chapters)) {
        parsedContent.chapters = options.chapters;
      }
      
      if (!parsedContent.format) {
        parsedContent.format = options.format;
      }
      
      if (!parsedContent.numberOfClasses) {
        parsedContent.numberOfClasses = options.numberOfClasses;
      }
      
      if (!parsedContent.learningObjectives) {
        parsedContent.learningObjectives = options.learningObjectives;
      }
      
      if (!parsedContent.requiredResources) {
        parsedContent.requiredResources = options.requiredResources;
      }
      
      // Ensure sections array exists and has valid structure
      if (!parsedContent.sections || !Array.isArray(parsedContent.sections) || parsedContent.sections.length === 0) {
        console.warn('Sections array is empty or invalid, creating default sections');
        parsedContent.sections = createDefaultSections(options);
      } else {
        // Validate each section and fix any issues
        parsedContent.sections = parsedContent.sections.map((section, index) => {
          if (!section.id) {
            section.id = (index + 1).toString();
          }
          
          if (!section.title) {
            section.title = `Section ${index + 1}`;
          }
          
          if (!section.content) {
            section.content = 'No content available for this section.';
          }
          
          return section;
        });
      }
      
      // Add creation timestamp
      parsedContent.createdAt = new Date();
      
      return parsedContent;
    }
    
    // If parsing fails, create default lesson plan
    console.warn('Failed to parse OpenAI response, creating default lesson plan');
    return createDefaultLessonPlan(options);
    
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    return createDefaultLessonPlan(options);
  }
};

/**
 * Creates default sections if parsing fails
 */
const createDefaultSections = (options: LessonPlanGenerationOptions): LessonPlanSection[] => {
  return [
    {
      id: '1',
      title: 'Overview',
      content: `# Lesson Plan Overview\n\nThis lesson plan covers ${options.subject} for ${options.class} focusing on ${options.chapters.join(', ')}. It is designed for ${options.numberOfClasses} class period(s).`
    },
    {
      id: '2',
      title: 'Learning Objectives',
      content: '## Learning Objectives\n\n- Students will understand key concepts related to the topic\n- Students will be able to apply the concepts to solve problems\n- Students will develop critical thinking skills through discussion and activities'
    },
    {
      id: '3',
      title: 'Required Materials',
      content: '## Required Materials\n\n- Textbooks\n- Worksheets\n- Presentation slides\n- Demonstration equipment'
    },
    {
      id: '4',
      title: 'Lesson Structure',
      content: '## Lesson Structure\n\n### Introduction (10 minutes)\n- Review of previous concepts\n- Introduction to new topic\n\n### Main Activity (30 minutes)\n- Explanation of key concepts\n- Demonstration\n- Guided practice\n\n### Conclusion (10 minutes)\n- Summary of key points\n- Assignment of homework'
    },
    {
      id: '5',
      title: 'Assessment',
      content: '## Assessment\n\n- Formative assessment through class participation\n- Homework assignments\n- Quiz at the end of the unit'
    }
  ];
};

/**
 * Creates a default LessonPlan if parsing fails
 */
const createDefaultLessonPlan = (options: LessonPlanGenerationOptions): LessonPlan => {
  return {
    title: `${options.subject} - ${options.chapters.join(', ')} Lesson Plan`,
    subject: options.subject,
    class: options.class,
    chapters: options.chapters,
    format: options.format,
    numberOfClasses: options.numberOfClasses,
    learningObjectives: options.learningObjectives,
    requiredResources: options.requiredResources,
    sections: createDefaultSections(options),
    createdAt: new Date()
  };
};

/**
 * Gets a description of the lesson plan format
 */
const getFormatDescription = (format: 'general' | 'subject-specific'): string => {
  if (format === 'general') {
    return 'General Lesson Plan';
  } else {
    return 'Subject-Specific Lesson Plan';
  }
};

/**
 * Gets detailed guidance for the lesson plan format
 */
const getFormatGuidance = (): string => {
  return `**General lesson plans** provide a foundational structure for educators to organize their teaching, focusing on universal skills and effective instructional delivery applicable across different subjects. They typically include components such as learning objectives, teaching activities, and assessment strategies. A general lesson plan aims to guide how a teacher will impart information, engage students, and check for understanding, often incorporating broader pedagogical approaches. For instance, explicit instruction, which involves setting clear criteria, modeling, assessing, and providing feedback, is a teaching strategy applicable across various subjects. Similarly, a lesson plan might include time for direct instruction, guided discussion, and activities for review.

In contrast, **subject-specific lesson plans** are tailored to the unique content, skills, and pedagogical considerations of individual subjects such as Physics, Mathematics, Chemistry, Biology, or Computer Science. These plans incorporate teaching methodologies and activities that are particularly effective for that subject. For example, a Physics lesson plan might heavily emphasize demonstrations and experiments to illustrate concepts, while a Mathematics lesson plan may focus on problem-solving and logical thinking, potentially incorporating real-world applications. Chemistry lesson plans often integrate lab-based learning to connect theory with observation, and Biology plans might prioritize hands-on activities like observing specimens and using diagrams. Computer Science lesson plans would likely involve practical coding exercises.

**Key Differences and Similarities in the CBSE Context:**

The Central Board of Secondary Education (CBSE) emphasizes a structured, competency-based approach to lesson planning.

*   **Subject-specific CBSE lesson plans** are mandated to align with **NCERT Learning Outcomes** and often include **competency codes** specific to the subject and grade level. They also may integrate **SARAS 3.0 indicators** for skill development and link to national frameworks like the **NEP 2020**. These plans often feature sections tailored to the subject, such as **conceptual modeling** in Physics or **problem-solving pedagogy** in Mathematics. They also specify **materials and resources** unique to the subject, such as lab equipment for science or graphing software for math. Assessment strategies in subject-specific plans are also designed to evaluate subject-related skills, such as problem-solving accuracy in math or experimental observation in science.

*   **General lesson plan frameworks** in the context of CBSE also emphasize key components like **learning objectives**, **instructional strategies**, and **assessment**. They promote **learner-centric approaches** and **activity-based learning** across subjects. General guidelines encourage the integration of **interdisciplinary linkages** and **values** in all lesson plans, regardless of the subject. The **5-step methodology** for lesson planning (Defining Objectives, Instructional Strategy Design, Activity Development, Assessment Methods, Differentiation Planning) is a general framework recommended by CBSE.

While general lesson plans provide a broad structure, **subject-specific plans delve into the nuances of teaching particular content effectively**, incorporating methodologies and assessment techniques best suited for the subject matter. For instance, Mathematics lesson plans often focus on logical reasoning and may have dual levels (Basic and Standard) catering to different competency levels. Science lesson plans, on the other hand, heavily integrate practical experiments.

**Pedagogical Approaches:**

Both general and subject-specific lesson plans within the CBSE framework are increasingly influenced by modern teaching methods that emphasize **student-centered learning**, **experiential learning**, and **competency-based education**. Strategies like **inquiry-based learning** and **problem-based learning** are encouraged across subjects. The goal is to move away from rote memorization towards building actual knowledge and skills. Differentiation to address diverse learning needs is also a crucial aspect integrated into both general frameworks and subject-specific applications. Furthermore, the integration of technology and **AI tools** is being explored to enhance lesson planning and resource creation.

In essence, while general lesson plans provide a common foundation for effective teaching, subject-specific lesson plans build upon this foundation by incorporating the unique pedagogical needs and content of different disciplines, ensuring a more targeted and effective learning experience for students. CBSE's approach emphasizes a blend of structured planning with flexibility to adapt to the specific demands of each subject while aligning with national educational goals.`;
};
