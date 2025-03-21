import { Resource } from '../types/resource';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, DocumentReference, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updateContentStats } from './contentStatsService';

export interface LessonPlanSection {
  id: string;
  title: string;
  content: string;
}

export interface LessonPlan {
  title: string;
  subject: string;
  class: string;
  book?: string; // Optional book name
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
  book?: string; // Optional book name
  chapters: string[];
  title?: string; // Optional title property
  format: 'general' | 'subject-specific';
  numberOfClasses: number;
  learningObjectives: string;
  requiredResources: string;
  resources: Resource[];
  userId?: string; // Optional user ID for associating lesson plans with a user
}

// Import the unified AI service
import { generateContent } from './aiService';

/**
 * Generates lesson plans using the OpenAI API based on PDF content and user preferences
 * and saves them to Firestore
 */
export const generateLessonPlan = async (options: LessonPlanGenerationOptions): Promise<LessonPlan> => {
  try {
    console.log('Generating lesson plan with options:', options);
    
    // Log generation attempt
    console.log('Attempting to generate lesson plan with AI service');
    
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
    
    // Call AI service (OpenAI with Gemini fallback)
    console.log('Calling AI service for lesson plan generation...');
    const content = await generateContent(systemPrompt, userPrompt);
    
    console.log('AI service response received successfully');
    
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
      book: lessonPlan.book || null, // Add the book field
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
    
    // Update content stats
    await updateContentStats(lessonPlan.userId || '', {
      type: 'lessonPlans',
      operation: 'increment'
    });
    
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
    // Note: We're not using orderBy here to avoid the composite index requirement
    // Instead, we'll sort the results in memory after fetching
    const q = query(
      collection(db, 'lessonplan'),
      where('userId', '==', userId)
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
        book: data.book || null, // Add the book field
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
    
    // Sort the lesson plans by createdAt in descending order (newest first)
    lessonPlans.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    console.log(`Retrieved ${lessonPlans.length} lesson plans for user ${userId}`);
    return lessonPlans;
    
  } catch (error) {
    console.error('Error retrieving lesson plans:', error);
    return [];
  }
};

/**
 * Retrieves a specific lesson plan by its ID from Firestore
 */
export const getLessonPlanById = async (lessonPlanId: string): Promise<LessonPlan | null> => {
  try {
    if (!lessonPlanId) {
      throw new Error('Lesson plan ID is required');
    }
    
    // Reference to the specific document
    const docRef = doc(db, 'lessonplan', lessonPlanId);
    
    // Get the document
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error(`Lesson plan with ID ${lessonPlanId} not found`);
      return null;
    }
    
    const data = docSnap.data();
    
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
      firebaseId: docSnap.id
    };
    
    console.log(`Retrieved lesson plan with ID ${lessonPlanId}`);
    return lessonPlan;
    
  } catch (error) {
    console.error(`Error retrieving lesson plan with ID ${lessonPlanId}:`, error);
    return null;
  }
};

/**
 * Updates an existing lesson plan in Firestore
 */
export const updateLessonPlan = async (lessonPlan: LessonPlan): Promise<boolean> => {
  try {
    if (!lessonPlan.firebaseId) {
      throw new Error('Lesson plan ID is required to update');
    }
    
    console.log('Updating lesson plan with ID:', lessonPlan.firebaseId);
    console.log('Update data:', JSON.stringify(lessonPlan, null, 2));
    
    // Reference to the specific document
    const docRef = doc(db, 'lessonplan', lessonPlan.firebaseId);
    
    // Create a Firestore-friendly version of the lesson plan
    const updatedData = {
      title: lessonPlan.title,
      subject: lessonPlan.subject,
      class: lessonPlan.class,
      chapters: lessonPlan.chapters,
      format: lessonPlan.format,
      numberOfClasses: lessonPlan.numberOfClasses,
      learningObjectives: lessonPlan.learningObjectives,
      requiredResources: lessonPlan.requiredResources,
      sections: lessonPlan.sections,
      updatedAt: serverTimestamp()
    };
    
    console.log('Firestore update data prepared:', updatedData);
    
    // Update the document
    await updateDoc(docRef, updatedData);
    
    console.log(`Successfully updated lesson plan with ID ${lessonPlan.firebaseId}`);
    return true;
    
  } catch (error) {
    console.error('Error updating lesson plan:', error);
    return false;
  }
};

/**
 * Creates the system prompt for the OpenAI API
 */
const createSystemPrompt = (options: LessonPlanGenerationOptions): string => {
  // Get the format description to include in the system prompt
  const formatDescription = getFormatDescription(options.format);
  
  return `You are an expert educational content designer specialized in creating comprehensive lesson plans and presentation slide decks from academic content. Your task is to analyze PDF documents and transform them into detailed, structured educational materials based on user specifications.

${formatDescription}

WORKFLOW:
1. Analyze the provided PDF content thoroughly
2. Structure the presentation according to the specified organization type
3. Create a detailed lesson plan with all required components
4. Design the requested number of slides that align with the lesson plan
5. Apply the selected template style
6. Incorporate any additional instructions provided by the user

INPUT VARIABLES:
- Class: ${options.class} - The educational level for which the materials are intended
- Subject: ${options.subject} - The academic subject being covered
- Chapters: ${options.chapters.join(', ')} - The specific chapters or sections from the PDF to include
- Format: "${options.format}" - The format to follow (general or subject-specific)
- Number of Classes: ${options.numberOfClasses} - The target number of classes to plan for
${options.learningObjectives ? `- Learning Objectives: ${options.learningObjectives}` : ''}
${options.requiredResources ? `- Required Resources: ${options.requiredResources}` : ''}

LESSON PLAN COMPONENTS:
1. Lesson Overview:
   - Title
   - Grade/Class level
   - Duration/Time allocation
   - NCERT learning outcomes alignment
   - Competency codes (where applicable)

2. Learning Objectives:
   - Knowledge objectives (what students will know)
   - Skill objectives (what students will be able to do)
   - Attitude objectives (values/perspectives students will develop)
   - Higher-order thinking skills to be developed

3. Materials and Resources:
   - Required textbooks/reference materials
   - Worksheets/handouts (with descriptions)
   - Digital tools/software
   - Equipment/manipulatives
   - Visual aids/models
   - Online resources/links

4. Lesson Structure:
   - Warm-up/Introduction (5-10 minutes)
   - Main instructional components with timeframes
   - Student activities with detailed descriptions
   - Transitions between activities
   - Closure/conclusion activities
   - Homework assignment (if applicable)

5. Teaching Methodologies:
   - Specific instructional strategies (e.g., direct instruction, inquiry-based, collaborative learning)
   - Differentiation approaches for diverse learners
   - Scaffolding techniques
   - Questions to promote critical thinking
   - Discussion prompts

6. Assessment Strategies:
   - Formative assessment methods with examples
   - Summative assessment criteria
   - Rubrics or marking schemes
   - Self/peer assessment opportunities
   - Success criteria for students

7. Extensions and Connections:
   - Cross-curricular links
   - Real-world applications
   - Extension activities for advanced learners
   - Remedial activities for struggling students
   - Follow-up lesson connections

PRESENTATION TYPES:
- Slide by Slide: Create detailed slides that follow the lesson plan chronologically, with each instructional segment having dedicated slides
- Topic Wise: Organize content by specific topics within the lesson, with dedicated slides for each key concept or skill area
- Chapter Wise: Provide comprehensive overviews that align with textbook chapters, highlighting major points and lesson sequences
- Unit Wise: Create broader coverage combining related lessons into cohesive units
- Lesson Wise: Develop focused content for individual lessons with detailed teaching and learning activities
- Concept Wise: Offer deep dives into specific concepts with detailed explanations and applications

SLIDE CREATION GUIDELINES:
1. Each slide should have a clear title that communicates its main focus
2. Include only essential content - avoid text-heavy slides
3. Use bullet points for clarity when appropriate
4. Include relevant visuals, diagrams, or charts that enhance understanding
5. Maintain consistent formatting throughout the presentation
6. Ensure proper flow and logical transitions between slides
7. Add slide numbers and maintain consistent headers/footers if specified in the template
8. Include slides specifically for learning objectives, materials, key teaching points, assessment strategies, and conclusion

OUTPUT FORMAT:
Format your response as a JSON object with the following structure:
{
  "title": "Lesson Plan title",
  "subject": "${options.subject}",
  "class": "${options.class}",
  "chapters": [${options.chapters.map(chapter => `"${chapter}"`).join(', ')}],
  "format": "${options.format}",
  "numberOfClasses": ${options.numberOfClasses},
  "learningObjectives": "${options.learningObjectives || ''}",
  "requiredResources": "${options.requiredResources || ''}",
  "sections": [
    {
      "id": "1",
      "title": "Lesson Overview",
      "content": "Content with proper markdown formatting..."
    },
    {
      "id": "2", 
      "title": "Learning Objectives",
      "content": "Content with proper markdown formatting..."
    },
    // Include all necessary sections following the LESSON PLAN COMPONENTS structure above
    // Add a dedicated Presentation Slides section with slide content and notes
  ]
}

For the presentation slides section, include:
- Title slide (including subject, chapter(s), and class level)
- Agenda/overview slide
- Learning objectives slide
- Materials and resources slide
- Content slides (formatted according to the appropriate presentation type)
- Assessment strategies slide
- Summary/conclusion slide

For each slide, provide:
- Slide title
- Slide content (text, bullet points, etc.)
- Description of any visuals or diagrams to include
- Speaker notes with additional context or explanation

Important formatting guidelines:
1. Use proper markdown formatting for the content field in each section
2. For headings, use # for main headings, ## for subheadings, etc.
3. For lists, use - or * for bullet points, and 1. 2. 3. for numbered lists
4. For emphasis, use *italic* or **bold**
5. For code or formulas, use \`inline code\` or \`\`\`code blocks\`\`\`
6. For tables, use markdown table syntax
7. Ensure the content is comprehensive, clear, and educationally valuable

ADDITIONAL CAPABILITIES:
- Adapt language complexity based on the specified class level
- Highlight key terms, definitions, and concepts
- Suggest appropriate visual elements for complex topics
- Recommend interactive elements or discussion questions
- Structure content to support different learning styles
- Include practical assessment examples and success criteria
- Provide detailed guidance for teachers on implementation

Maintain academic accuracy while making the content accessible and engaging for the specified educational level. Ensure all lesson plans align with current educational best practices and CBSE/NCERT guidelines where applicable.

IMPORTANT: Your response must be a valid JSON object without any additional text before or after it.`;
};

/**
 * Creates the user prompt for the OpenAI API
 */
const createUserPrompt = (options: LessonPlanGenerationOptions, pdfUrls: string[]): string => {
  return `Please create a detailed, comprehensive lesson plan for ${options.class} ${options.subject} covering the following chapters: ${options.chapters.join(', ')}.
  
The content is available in the following PDF files:
${pdfUrls.map(url => `- ${url}`).join('\n')}

IMPORTANT: I need HIGHLY DETAILED content for each section of the lesson plan. For each component:

1. Lesson Overview - Include detailed information about duration, grade level, and alignment with NCERT outcomes.

2. Learning Objectives - Provide specific, measurable objectives covering knowledge, skills, and attitudes students will develop. Don't be vague; list exactly what students will know and be able to do.

3. Materials and Resources - List ALL specific materials needed with detailed descriptions (e.g., specific worksheets, digital tools, equipment, models, and links).

4. Lesson Structure - Include detailed descriptions of:
   - Warm-up activities with exact questions/prompts
   - Main instructional components with precise timeframes
   - Detailed explanations of student activities (not just "group work" but what they'll do and discuss)
   - Clear transitions between activities
   - Specific closure activities
   - Exact homework assignments if applicable

5. Teaching Methodologies - Outline specific instructional strategies with examples of implementation, differentiation approaches for different learner types, detailed scaffolding techniques, and at least 5-7 critical thinking questions.

6. Assessment Strategies - Include detailed formative and summative assessment methods, specific rubrics or marking criteria, and clear success criteria for students.

7. Extensions and Connections - Provide specific cross-curricular links, real-world applications, and targeted extension activities.

For the presentation slides section, include comprehensive content for each slide, with detailed speaker notes that provide teaching guidance.

Ensure the content is:
- Highly specific (not generic)
- Curriculum-aligned
- Age-appropriate for ${options.class}
- Pedagogically sound
- Practically implementable in a classroom setting

Remember to format your response as a valid JSON object with the structure I specified. Include extensive, detailed content for EACH section.`;
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
      
      // Ensure book field is present
      if (!parsedContent.book && options.book) {
        parsedContent.book = options.book;
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
    book: options.book, // Add the book field
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

// Commented out to fix lint error - this function is not currently used but kept for future reference
/**
 * Gets detailed guidance for the lesson plan format
 */
/*
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
};*/

/**
 * Deletes a lesson plan from Firestore
 * @param id The Firestore document ID of the lesson plan to delete
 * @returns A boolean indicating whether the deletion was successful
 */
export const deleteLessonPlan = async (id: string): Promise<boolean> => {
  try {
    console.log(`Attempting to delete lesson plan with ID ${id}`);
    
    if (!id) {
      console.error('Cannot delete lesson plan: No ID provided');
      return false;
    }
    
    // First check if the document exists
    const docRef = doc(db, 'lessonplan', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error(`Lesson plan with ID ${id} does not exist in the 'lessonplan' collection`);
      
      // Let's try to find it in other possible collections
      console.log('Trying alternative collection name: lessonPlans');
      const altDocRef = doc(db, 'lessonPlans', id);
      const altDocSnap = await getDoc(altDocRef);
      
      if (altDocSnap.exists()) {
        console.log(`Found lesson plan in 'lessonPlans' collection instead`);
        await deleteDoc(altDocRef);
        console.log(`Successfully deleted lesson plan with ID ${id} from 'lessonPlans' collection`);
        return true;
      } else {
        console.error(`Lesson plan with ID ${id} not found in any collection`);
        return false;
      }
    }
    
    // Delete the document from the primary collection
    console.log(`Deleting document from 'lessonplan' collection`);
    await deleteDoc(docRef);
    
    // Update content stats if userId exists
    const lessonPlanData = docSnap.data();
    if (lessonPlanData.userId) {
      await updateContentStats(lessonPlanData.userId, {
        type: 'lessonPlans',
        operation: 'decrement'
      });
    }
    
    console.log(`Successfully deleted lesson plan with ID ${id}`);
    return true;
    
  } catch (error) {
    console.error('Error deleting lesson plan:', error);
    return false;
  }
};
