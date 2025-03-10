import React from 'react';
import { CheckCircle, BookOpen, Layout, FileText, List } from 'lucide-react';

interface Section {
  title: string;
  content: string[];
  type: 'text' | 'definition' | 'formula' | 'key-point' | 'summary';
}

const mockNotes = {
  title: 'Chemical Bonding',
  subject: 'Chemistry',
  class: 'Class 11',
  type: 'Detailed Notes',
  layout: 'Two Column',
  sections: [
    {
      title: 'Introduction to Chemical Bonding',
      type: 'text',
      content: [
        'Chemical bonding is the process by which atoms combine to form molecules',
        'The type of bond formed depends on the electronic configuration of atoms',
        'Main types: Ionic, Covalent, and Metallic bonds',
      ],
    },
    {
      title: 'Key Definitions',
      type: 'definition',
      content: [
        'Chemical Bond: The force of attraction that holds atoms together',
        'Valence Electrons: Electrons in the outermost shell of an atom',
        'Electronegativity: Tendency of an atom to attract shared electrons',
      ],
    },
    {
      title: 'Important Formulas',
      type: 'formula',
      content: [
        'Bond Energy = Energy required to break one mole of bonds',
        'Bond Length = Distance between nuclei of bonded atoms',
        'Lattice Energy ∝ (q₁q₂)/r',
      ],
    },
    {
      title: 'Key Points',
      type: 'key-point',
      content: [
        'Ionic bonds form between metals and non-metals',
        'Covalent bonds involve sharing of electrons',
        'Bond strength affects physical properties',
      ],
    },
    {
      title: 'Summary',
      type: 'summary',
      content: [
        'Chemical bonds are essential for molecule formation',
        'Different types of bonds have distinct characteristics',
        'Understanding bonding helps predict molecular properties',
      ],
    },
  ],
};

const getSectionIcon = (type: string) => {
  switch (type) {
    case 'definition':
      return BookOpen;
    case 'formula':
      return Layout;
    case 'key-point':
      return List;
    case 'summary':
      return FileText;
    default:
      return FileText;
  }
};

export default function ClassNotesPreview() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
      {/* Notes Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mockNotes.title}
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-1" />
            Generated Successfully
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>{mockNotes.subject} - {mockNotes.class}</span>
          </div>
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            <span>{mockNotes.type}</span>
          </div>
          <div className="flex items-center">
            <Layout className="w-4 h-4 mr-2" />
            <span>{mockNotes.layout}</span>
          </div>
        </div>
      </div>

      {/* Notes Content */}
      <div className="p-6">
        <div className="space-y-8">
          {mockNotes.sections.map((section, index) => {
            const Icon = getSectionIcon(section.type);
            
            return (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6"
              >
                <div className="flex items-center mb-4">
                  <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`
                        pl-4 border-l-2 
                        ${section.type === 'definition'
                          ? 'border-blue-500 dark:border-blue-400'
                          : section.type === 'formula'
                          ? 'border-purple-500 dark:border-purple-400'
                          : section.type === 'key-point'
                          ? 'border-green-500 dark:border-green-400'
                          : section.type === 'summary'
                          ? 'border-orange-500 dark:border-orange-400'
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}
                    >
                      <p className="text-gray-600 dark:text-gray-300">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}