import { JSX } from 'react';
import { templateOptions } from '../../../../../components/teacher/content/presentations/PresentationTemplates';

interface AdvancedSettingsProps {
  slideCount: number;
  setSlideCount: (count: number) => void;
  designTemplate: string;
  setDesignTemplate: (template: string) => void;
  additionalInstructions: string;
  setAdditionalInstructions: (instructions: string) => void;
}

export default function AdvancedSettings({
  slideCount,
  setSlideCount,
  designTemplate,
  setDesignTemplate,
  additionalInstructions,
  setAdditionalInstructions
}: AdvancedSettingsProps): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Advanced Settings
      </h2>
      
      <div className="space-y-6">
        {/* Slide Count */}
        <div>
          <label htmlFor="slideCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Number of Slides
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              id="slideCount"
              min={5}
              max={20}
              step={1}
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[2rem] text-center">
              {slideCount}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Recommended: 8-12 slides for a 30-minute presentation
          </p>
        </div>
        
        {/* Design Template */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Design Template
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {templateOptions.map((template) => (
              <div 
                key={template.id}
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
                  designTemplate === template.id 
                    ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-50' 
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setDesignTemplate(template.id)}
              >
                <div 
                  className="h-32 w-full"
                  style={{
                    backgroundImage: `url(${template.backgroundUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className={`h-full w-full flex flex-col justify-center items-center p-4 ${
                    designTemplate === template.id 
                      ? 'bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-10' 
                      : 'bg-black bg-opacity-20 dark:bg-white dark:bg-opacity-20'
                  }`}>
                    <div 
                      className="bg-white dark:bg-gray-800 rounded-md px-3 py-2 text-center"
                      style={{
                        fontFamily: template.fontFamily
                      }}
                    >
                      <h3 className="text-sm font-medium" style={{ color: template.textColor }}>
                        {template.name}
                      </h3>
                      <div className="h-1 w-8 mx-auto mt-1" style={{ backgroundColor: template.accentColor }}></div>
                    </div>
                  </div>
                </div>
                
                {designTemplate === template.id && (
                  <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional Instructions */}
        <div>
          <label htmlFor="additionalInstructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Additional Instructions (Optional)
          </label>
          <textarea
            id="additionalInstructions"
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Add any specific instructions or preferences for your presentation..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            For example: "Focus on practical examples", "Include historical context", "Make it suitable for beginners"
          </p>
        </div>
      </div>
    </div>
  );
}
