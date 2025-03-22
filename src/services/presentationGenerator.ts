import pptxgen from 'pptxgenjs';
import { Presentation, Slide } from './presentationService';
import { templateOptions, TemplateOption } from '../components/teacher/content/presentations/PresentationTemplates';

// Type guard to check if content is a string array
function isStringArray(content: any): content is string[] {
  return Array.isArray(content) && content.every(item => typeof item === 'string');
}

// Helper function to get template styles based on template ID
function getTemplateStyles(templateId: string): TemplateOption {
  const template = templateOptions.find(t => t.id === templateId) || templateOptions[0];
  console.log(`Using template: ${template.name} (${template.id})`);
  return template;
}

// Helper function to create a master slide with template styling
function createMasterSlide(pptx: pptxgen, templateStyle: TemplateOption) {
  // Create a master slide with the template styling based on layout type
  const masterProps: any = {
    title: templateStyle.id,
    background: { color: 'FFFFFF' }, // White background as base
    objects: [
      // Footer with template name
      { 
        text: { 
          text: templateStyle.name + ' Template',
          options: {
            x: 0.5, y: 6.5, w: 2.0, h: 0.3,
            fontSize: 8,
            fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
            color: templateStyle.accentColor.replace('#', ''),
            transparency: 50,
            align: 'left'
          }
        }
      }
    ]
  };
  
  // Create the master slide
  return pptx.defineSlideMaster(masterProps);
}



/**
 * Generates a PowerPoint presentation (.pptx) file from presentation data
 * @param presentation The presentation data to convert to PowerPoint
 * 
 * This generator applies the template styling from the presentation's template property
 * to create a professionally styled PowerPoint presentation that matches the web preview.
 */
export const generatePowerPointPresentation = async (presentation: Presentation) => {
  try {
    console.log('Starting PowerPoint generation with data:', JSON.stringify(presentation, null, 2));
    
    // Get template styles based on the presentation template
    const templateStyle = getTemplateStyles(presentation.template);
    console.log('Using template:', templateStyle.name);
    
    // Create a new PowerPoint presentation
    const pptx = new pptxgen();
    
    // Set presentation properties
    pptx.author = 'TeachAssist';
    pptx.company = 'TeachAssist';
    pptx.subject = presentation.subject;
    pptx.title = presentation.title;
    
    // Create a master slide with template styling
    createMasterSlide(pptx, templateStyle);
    
    // Set additional presentation properties based on template
    // Use string literal for layout to satisfy TypeScript
    pptx.layout = templateStyle.layout === 'left-aligned' ? 'LAYOUT_WIDE' : 'LAYOUT_16x9';
    
    // Note: We're not setting theme directly as it causes TypeScript errors
    // Instead, we'll use individual styling options throughout the presentation
  
  // Create title slide
  const titleSlide = pptx.addSlide();
  
  // Apply title slide styling based on template
  // Create a background that matches the web version
  if (templateStyle.id === 'modern') {
    // Modern template: Clean white background with accent elements
    titleSlide.background = { color: 'FFFFFF' };
    
    // Add a horizontal accent bar at the bottom of the title
    // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
    titleSlide.addShape('RECTANGLE', { 
      x: 0.5, y: 2.5, w: 9.0, h: 0.05, 
      fill: { color: templateStyle.accentColor.replace('#', '') }
    });
  } else if (templateStyle.id === 'academic') {
    // Academic template: Professional look with border
    titleSlide.background = { color: 'FFFFFF' };
    
    // Add a classic border around the entire slide
    // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
    titleSlide.addShape('RECTANGLE', { 
      x: 0.2, y: 0.2, w: 9.6, h: 6.6, 
      fill: { color: 'FFFFFF00' },
      line: { color: templateStyle.accentColor.replace('#', ''), width: 2 }
    });
    
    // Add a subtle header bar
    // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
    titleSlide.addShape('RECTANGLE', { 
      x: 0, y: 0, w: 10, h: 0.4, 
      fill: { color: templateStyle.accentColor.replace('#', '') + '22' }
    });
  } else if (templateStyle.id === 'creative') {
    // Creative template: Artistic design with organic shapes
    titleSlide.background = { color: 'FFFFFF' };
    
    // Add decorative elements that match the web version
    // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
    titleSlide.addShape('OVAL', { 
      x: 8.5, y: 0.2, w: 1.0, h: 1.0, 
      fill: { color: templateStyle.accentColor.replace('#', '') + '55' }
    });
    // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
    titleSlide.addShape('OVAL', { 
      x: 0.5, y: 5.5, w: 1.5, h: 1.5, 
      fill: { color: templateStyle.accentColor.replace('#', '') + '33' }
    });
  }
  
  // Add title with template styling that matches the web version
  titleSlide.addText(presentation.title, {
    x: templateStyle.layout === 'left-aligned' ? 0.5 : 0.5,
    y: 1.0,
    w: '90%',
    h: 1.5,
    fontSize: 44,
    fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
    color: templateStyle.textColor.replace('#', ''),
    bold: true,
    align: templateStyle.layout === 'left-aligned' ? 'left' : 'center',
  });
  
  // Add subtitle with subject and class
  titleSlide.addText(`${presentation.subject} - ${presentation.class}`, {
    x: 0.5,
    y: 2.5,
    w: '90%',
    h: 0.5,
    fontSize: 24,
    fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
    color: templateStyle.accentColor.replace('#', ''),
    align: templateStyle.layout === 'left-aligned' ? 'left' : 'center',
  });
  
  // Add date
  const currentDate = new Date().toLocaleDateString();
  titleSlide.addText(currentDate, {
    x: 0.5,
    y: 5.0,
    w: '90%',
    h: 0.5,
    fontSize: 14,
    fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
    color: templateStyle.textColor.replace('#', ''),
    align: templateStyle.layout === 'left-aligned' ? 'left' : 'center',
  });
  
  // Process each slide in the presentation
  presentation.slides.forEach((slide: Slide, index: number) => {
    const pptSlide = pptx.addSlide();
    
    // Apply styling based on template that matches the web version
    // Set a clean white background as base
    pptSlide.background = { color: 'FFFFFF' };
    
    // Add template-specific decorative elements that match the web version
    if (templateStyle.id === 'modern') {
      // Modern template: Clean design with accent elements
      // Add a thin accent line at the top
      // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
      pptSlide.addShape('RECTANGLE', { 
        x: 0, y: 0, w: 10, h: 0.1, 
        fill: { color: templateStyle.accentColor.replace('#', '') }
      });
      
      // Add a semi-transparent background for content area
      // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
      pptSlide.addShape('RECTANGLE', { 
        x: 0.5, y: 1.2, w: 9.0, h: 5.0, 
        fill: { color: 'F8FAFC' },
        line: { color: 'E2E8F0', width: 1 }
      });
    } else if (templateStyle.id === 'academic') {
      // Academic template: Professional look with header bar
      // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
      pptSlide.addShape('RECTANGLE', { 
        x: 0, y: 0, w: 10, h: 0.6, 
        fill: { color: templateStyle.accentColor.replace('#', '') + '22' }
      });
      
      // Add left border for title (matches web version)
      // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
      pptSlide.addShape('RECTANGLE', { 
        x: 0.5, y: 0.3, w: 0.1, h: 0.8, 
        fill: { color: templateStyle.accentColor.replace('#', '') }
      });
    } else if (templateStyle.id === 'creative') {
      // Creative template: Artistic design with organic shapes
      // Add decorative corner element
      // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
      pptSlide.addShape('OVAL', { 
        x: 9.0, y: 0.2, w: 0.8, h: 0.8, 
        fill: { color: templateStyle.accentColor.replace('#', '') + '44' }
      });
      
      // Add a subtle background for content
      // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
      pptSlide.addShape('RECTANGLE', { 
        x: 0.5, y: 1.2, w: 9.0, h: 5.0, 
        fill: { color: templateStyle.accentColor.replace('#', '') + '08' },
        line: { color: templateStyle.accentColor.replace('#', '') + '22', width: 1 }
      });
    }
    
    // Add slide title with template styling that matches the web version
    pptSlide.addText(slide.title, {
      x: templateStyle.id === 'academic' ? 0.7 : 0.5, // Adjust for academic template's left border
      y: templateStyle.id === 'academic' ? 0.3 : 0.3,
      w: '90%',
      h: 0.8,
      fontSize: 28,
      fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
      color: templateStyle.textColor.replace('#', ''),
      bold: true,
      align: templateStyle.layout === 'left-aligned' ? 'left' : 'center',
    });
    
    // Add slide content
    // Handle different content formats
    let contentLines: string[] = [];
    
    if (isStringArray(slide.content)) {
      // If content is a string array (as per interface), use it directly
      contentLines = slide.content;
    } else if (typeof slide.content === 'string') {
      // For backward compatibility, handle string content
      contentLines = (slide.content as string).split('\n');
    } else {
      // Fallback for unexpected content format
      contentLines = ['No content available'];
    }
    
    if (contentLines.length > 1) {
      // Create a bullet list for multiple lines that matches the web version
      // Use type assertion to satisfy TypeScript
      pptSlide.addText(contentLines.map(line => ({ text: line })) as any, {
        x: templateStyle.layout === 'left-aligned' ? 0.7 : (templateStyle.layout === 'grid' ? 0.7 : 1.0),
        y: 1.5,
        w: '85%',
        h: 4.0,
        fontSize: 18,
        fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
        color: templateStyle.accentColor.replace('#', ''), // Use accent color for bullet points
        bullet: { 
          type: 'bullet' // Only 'bullet' and 'number' are supported in the type definitions
        },
        lineSpacing: 30,
        align: 'left', // Always left-align bullet points for readability
      });
    } else if (contentLines.length === 1) {
      // Single paragraph content with styling that matches the web version
      pptSlide.addText(contentLines[0] || 'No content available', {
        x: templateStyle.layout === 'left-aligned' ? 0.7 : (templateStyle.layout === 'grid' ? 0.7 : 1.0),
        y: 1.5,
        w: '85%',
        h: 4.0,
        fontSize: 18,
        fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
        color: templateStyle.textColor.replace('#', ''),
        lineSpacing: 30,
        align: templateStyle.layout === 'centered' ? 'center' : 'left',
      });
    }
    
    // Add slide number with template styling
    pptSlide.addText(`${index + 1}/${presentation.slides.length}`, {
      x: 9.0,
      y: 6.5,
      w: 0.5,
      h: 0.3,
      fontSize: 10,
      fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
      color: templateStyle.accentColor.replace('#', ''),
      align: 'right',
    });
    
    // Add template name as a subtle footer
    pptSlide.addText(`${templateStyle.name} Template`, {
      x: 0.5,
      y: 6.5,
      w: 2.0,
      h: 0.3,
      fontSize: 8,
      fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
      color: templateStyle.accentColor.replace('#', ''),
      // Use transparency instead of opacity for compatibility
      transparency: 50,
      align: 'left',
    });
  });
  
  // Generate and download the PowerPoint file
  console.log('Generating PowerPoint file with title:', presentation.title);
  
  // Create a clean filename from the presentation title
  const sanitizedTitle = presentation.title.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${sanitizedTitle}_${templateStyle.id}.pptx`;
  
  // Write the file and trigger download
  await pptx.writeFile({ fileName: filename });
  console.log('PowerPoint file generated successfully:', filename);
  
  return true; // Return success status
  } catch (error) {
    console.error('Error in generatePowerPointPresentation:', error);
    throw error; // Re-throw to be handled by the caller
  }
};
