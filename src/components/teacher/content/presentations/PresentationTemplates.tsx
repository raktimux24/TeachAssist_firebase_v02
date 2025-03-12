export interface TemplateOption {
  id: string;
  name: string;
  description: string;
  backgroundUrl: string;
  textColor: string;
  darkTextColor: string;
  accentColor: string;
  darkAccentColor: string;
  fontFamily: string;
  layout: 'centered' | 'left-aligned' | 'grid';
}

interface PresentationTemplatesProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  isDarkMode: boolean;
}

// Template options with their respective styles
export const templateOptions: TemplateOption[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and minimalist design with a focus on content',
    backgroundUrl: '/assets/images/presentation-templates/modern-bg.jpg',
    textColor: '#333333',
    darkTextColor: '#ffffff',
    accentColor: '#3B82F6',
    darkAccentColor: '#60a5fa',
    fontFamily: 'Inter, sans-serif',
    layout: 'centered'
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Professional template suitable for educational presentations',
    backgroundUrl: '/assets/images/presentation-templates/academic-bg.jpg',
    textColor: '#1F2937',
    darkTextColor: '#f3f4f6',
    accentColor: '#4B5563',
    darkAccentColor: '#9ca3af',
    fontFamily: 'Georgia, serif',
    layout: 'left-aligned'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Artistic design with organic shapes and natural elements',
    backgroundUrl: '/assets/images/presentation-templates/creative-bg.jpg',
    textColor: '#4B5563',
    darkTextColor: '#e5e7eb',
    accentColor: '#8B5CF6',
    darkAccentColor: '#a78bfa',
    fontFamily: 'Poppins, sans-serif',
    layout: 'grid'
  }
];

export default function PresentationTemplates({
  selectedTemplate,
  onSelectTemplate,
  isDarkMode
}: PresentationTemplatesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Select Template
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templateOptions.map((template) => (
          <div
            key={template.id}
            className={`
              relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all
              ${selectedTemplate === template.id 
                ? 'border-primary-500 shadow-md' 
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }
            `}
            onClick={() => onSelectTemplate(template.id)}
          >
            {/* Template Preview */}
            <div 
              className="h-40 bg-cover bg-center"
              style={{
                backgroundImage: `url(${template.backgroundUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-2 rounded shadow-sm">
                  <h4 className="text-sm font-medium" style={{ color: isDarkMode ? template.darkTextColor : template.textColor }}>
                    {template.name} Template
                  </h4>
                </div>
                <div className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-2 rounded shadow-sm">
                  <p className="text-xs" style={{ color: isDarkMode ? '#d1d5db' : template.textColor }}>
                    {template.description}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Selection Indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
