import { Document, Paragraph, TextRun, HeadingLevel, BorderStyle, Packer } from 'docx';

interface Section {
  title: string;
  content: string[];
  type: 'text' | 'definition' | 'formula' | 'key-point' | 'summary';
}

interface NotesData {
  title: string;
  subject: string;
  class: string;
  type: string;
  layout: string;
  sections: Section[];
}

interface LessonPlanSection {
  id: string;
  title: string;
  content: string;
}

interface LessonPlanData {
  title: string;
  subject: string;
  class: string;
  book?: string;
  numberOfClasses: number;
  sections: LessonPlanSection[];
  createdAt: Date;
}

export const generateDocument = async (notesData: NotesData) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          text: notesData.title,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 }
        }),
        
        // Metadata
        new Paragraph({
          children: [
            new TextRun({ text: `${notesData.subject} - ${notesData.class}`, bold: true }),
            new TextRun({ text: " | " }),
            new TextRun({ text: notesData.type }),
            new TextRun({ text: " | " }),
            new TextRun({ text: notesData.layout })
          ],
          spacing: { after: 400 }
        }),

        // Sections
        ...notesData.sections.flatMap(section => [
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          ...section.content.map(content => 
            new Paragraph({
              text: content,
              spacing: { before: 100, after: 100 },
              border: {
                left: {
                  style: BorderStyle.SINGLE,
                  size: 8,
                  color: getSectionColor(section.type),
                }
              },
              indent: { left: 360 } // 0.25 inch indent
            })
          )
        ])
      ]
    }]
  });

  // Create download link and trigger download
  Packer.toBlob(doc).then(blob => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${notesData.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  });
};

const getSectionColor = (type: string): string => {
  switch (type) {
    case 'definition':
      return '3B82F6'; // blue-500
    case 'formula':
      return '8B5CF6'; // purple-500
    case 'key-point':
      return '22C55E'; // green-500
    case 'summary':
      return 'F97316'; // orange-500
    default:
      return '6B7280'; // gray-500
  }
}; 

export const generateLessonPlanDocument = async (lessonPlanData: LessonPlanData) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          text: lessonPlanData.title,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 }
        }),
        
        // Metadata
        new Paragraph({
          children: [
            new TextRun({ text: `${lessonPlanData.subject} - ${lessonPlanData.class}`, bold: true }),
            new TextRun({ text: lessonPlanData.book ? ` | ${lessonPlanData.book}` : '' }),
            new TextRun({ text: ` | ${lessonPlanData.numberOfClasses} ${lessonPlanData.numberOfClasses > 1 ? 'Classes' : 'Class'}` })
          ],
          spacing: { after: 400 }
        }),

        // Sections
        ...lessonPlanData.sections.flatMap(section => [
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: section.content,
            spacing: { before: 100, after: 100 },
            border: {
              left: {
                style: BorderStyle.SINGLE,
                size: 8,
                color: '6B7280', // gray-500
              }
            },
            indent: { left: 360 } // 0.25 inch indent
          })
        ])
      ]
    }]
  });

  // Create download link and trigger download
  Packer.toBlob(doc).then(blob => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lessonPlanData.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  });
};