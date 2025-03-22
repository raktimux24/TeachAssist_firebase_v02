import pptxgen from 'pptxgenjs';
import { FlashcardSet } from './openai';
import { templateOptions } from '../components/teacher/content/presentations/PresentationTemplates';

/**
 * Generates a PowerPoint presentation (.pptx) file from flashcard data
 * @param flashcardSet The flashcard set data to convert to PowerPoint
 */
// Define a type that matches the structure of the flashcard data from Firebase
interface FirebaseFlashcardSet extends Omit<FlashcardSet, 'flashcards'> {
  id?: string;
  userId?: string;
  createdAt?: any;
  updatedAt?: any;
  generationOptions?: any;
  cards: Array<{
    front: string;
    back: string;
    id?: string;
  }>;
}

export const generateFlashcardPowerPoint = async (flashcardSet: FirebaseFlashcardSet) => {
  try {
    console.log('Starting Flashcard PowerPoint generation');
    
    // Use modern template by default for flashcards
    const templateStyle = templateOptions.find(t => t.id === 'modern') || templateOptions[0];
    
    // Create a new PowerPoint presentation
    const pptx = new pptxgen();
    
    // Set presentation properties
    pptx.author = 'TeachAssist';
    pptx.company = 'TeachAssist';
    pptx.subject = flashcardSet.subject || '';
    pptx.title = `${flashcardSet.title} - Flashcards`;
    
    // Set layout to 16:9 for modern look
    pptx.layout = 'LAYOUT_16x9';
    
    // Create title slide
    const titleSlide = pptx.addSlide();
    
    // Apply title slide styling
    titleSlide.background = { color: 'FFFFFF' };
    
    // Add accent bar at the bottom
    // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
    titleSlide.addShape('RECTANGLE', {
      x: 0, y: 5.0, w: '100%', h: 0.15,
      fill: { color: templateStyle.accentColor.replace('#', '') }
    });
    
    // Add title
    titleSlide.addText(flashcardSet.title, {
      x: 0.5, y: 1.5, w: '90%', h: 1.0,
      fontSize: 44,
      fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
      color: templateStyle.textColor.replace('#', ''),
      bold: true,
      align: 'center'
    });
    
    // Add subtitle
    titleSlide.addText(`Flashcards for ${flashcardSet.subject || ''} - ${flashcardSet.class || ''}`, {
      x: 0.5, y: 2.7, w: '90%', h: 0.5,
      fontSize: 24,
      fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
      color: templateStyle.accentColor.replace('#', ''),
      align: 'center'
    });
    
    // Add card count
    titleSlide.addText(`${flashcardSet.cards.length || 0} Cards`, {
      x: 0.5, y: 3.5, w: '90%', h: 0.3,
      fontSize: 18,
      fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
      color: templateStyle.textColor.replace('#', ''),
      align: 'center'
    });
    
    // Create slides for each flashcard - front side
    flashcardSet.cards.forEach((card, index) => {
      // Front side of the card
      const frontSlide = pptx.addSlide();
      frontSlide.background = { color: 'FFFFFF' };
      
      // Add card number indicator
      frontSlide.addText(`Card ${index + 1} - Front`, {
        x: 0.5, y: 0.3, w: '90%', h: 0.3,
        fontSize: 14,
        fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
        color: templateStyle.accentColor.replace('#', ''),
        align: 'center'
      });
      
      // Add a card-like shape
      // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
      frontSlide.addShape('RECTANGLE', {
        x: 1.0, y: 1.0, w: 8.0, h: 4.5,
        fill: { color: 'FFFFFF' },
        line: { color: templateStyle.accentColor.replace('#', ''), width: 2 },
        shadow: { type: 'outer', blur: 10, offset: 3, angle: 45, color: '808080', opacity: 0.3 }
      });
      
      // Add front content
      frontSlide.addText(card.front, {
        x: 1.5, y: 1.5, w: 7.0, h: 3.5,
        fontSize: 28,
        fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
        color: templateStyle.textColor.replace('#', ''),
        align: 'center',
        valign: 'middle',
        breakLine: true
      });
      
      // Back side of the card
      const backSlide = pptx.addSlide();
      backSlide.background = { color: 'FFFFFF' };
      
      // Add card number indicator
      backSlide.addText(`Card ${index + 1} - Back`, {
        x: 0.5, y: 0.3, w: '90%', h: 0.3,
        fontSize: 14,
        fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
        color: templateStyle.accentColor.replace('#', ''),
        align: 'center'
      });
      
      // Add a card-like shape with different styling for back
      // @ts-ignore - Shape names are defined in pptxgenjs but TypeScript definitions are incomplete
      backSlide.addShape('RECTANGLE', {
        x: 1.0, y: 1.0, w: 8.0, h: 4.5,
        fill: { color: templateStyle.accentColor.replace('#', '') + '15' }, // Light accent color
        line: { color: templateStyle.accentColor.replace('#', ''), width: 2 },
        shadow: { type: 'outer', blur: 10, offset: 3, angle: 45, color: '808080', opacity: 0.3 }
      });
      
      // Add back content
      backSlide.addText(card.back, {
        x: 1.5, y: 1.5, w: 7.0, h: 3.5,
        fontSize: 24,
        fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
        color: templateStyle.textColor.replace('#', ''),
        align: 'left',
        valign: 'top',
        breakLine: true
      });
    });
    
    // Add a summary slide at the end
    const summarySlide = pptx.addSlide();
    summarySlide.background = { color: 'FFFFFF' };
    
    // Add title
    summarySlide.addText('Summary', {
      x: 0.5, y: 0.5, w: '90%', h: 0.5,
      fontSize: 36,
      fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
      color: templateStyle.textColor.replace('#', ''),
      bold: true,
      align: 'center'
    });
    
    // Add flashcard set details
    summarySlide.addText([
      { text: 'Flashcard Set: ', options: { bold: true } },
      { text: flashcardSet.title },
      { text: '\nSubject: ', options: { bold: true } },
      { text: flashcardSet.subject || 'N/A' },
      { text: '\nClass: ', options: { bold: true } },
      { text: flashcardSet.class || 'N/A' },
      { text: '\nTotal Cards: ', options: { bold: true } },
      { text: `${flashcardSet.cards.length || 0}` }
    ], {
      x: 1.0, y: 1.5, w: 8.0, h: 2.0,
      fontSize: 20,
      fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
      color: templateStyle.textColor.replace('#', ''),
      align: 'left'
    });
    
    // Add a footer note
    summarySlide.addText('Generated by TeachAssist', {
      x: 0.5, y: 5.0, w: '90%', h: 0.3,
      fontSize: 12,
      fontFace: templateStyle.fontFamily.split(',')[0] || 'Arial',
      color: templateStyle.accentColor.replace('#', ''),
      align: 'center',
      italic: true
    });
    
    // Generate the PPTX file
    const filename = `${flashcardSet.title.replace(/\s+/g, '_')}_flashcards.pptx`;
    
    // In browser environment, we need to use the writeFile method that returns a Blob
    // and then create a download link
    // @ts-ignore - outputType is supported in pptxgenjs but TypeScript definitions are incomplete
    const pptxBlob = await pptx.writeFile({ outputType: 'blob' });
    
    // Create a URL for the blob
    // Create a URL for the blob
    const blobUrl = URL.createObjectURL(new Blob([pptxBlob], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }));
    
    // Create a link element to trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    
    // Append to the document, click, and remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up the blob URL
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
    
    console.log(`PowerPoint file generated: ${filename}`);
    return filename;
  } catch (error) {
    console.error('Error generating PowerPoint from flashcards:', error);
    throw error;
  }
};
