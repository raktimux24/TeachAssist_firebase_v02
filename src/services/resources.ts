import { fetchResources } from '../firebase/resources';
import { Resource } from '../types/resource';

/**
 * Fetches PDF resources based on class, subject, and chapters
 */
export const fetchPdfResources = async (
  classId: string,
  subjectId: string,
  chapters: string[]
): Promise<Resource[]> => {
  try {
    console.log('Fetching PDF resources for:', { classId, subjectId, chapters });
    
    // Create an array to store all resources
    const allResources: Resource[] = [];
    
    // Fetch resources for each chapter
    for (const chapter of chapters) {
      const resources = await fetchResources({
        class: classId,
        subject: subjectId,
        chapter: chapter
      });
      
      // Filter for PDF files only
      const pdfResources = resources.filter(resource => 
        resource.fileType.toLowerCase() === 'application/pdf' || 
        resource.fileType.toLowerCase() === 'pdf' ||
        resource.fileName.toLowerCase().endsWith('.pdf')
      );
      
      allResources.push(...pdfResources);
    }
    
    console.log(`Found ${allResources.length} PDF resources`);
    return allResources;
  } catch (error) {
    console.error('Error fetching PDF resources:', error);
    throw error;
  }
};
