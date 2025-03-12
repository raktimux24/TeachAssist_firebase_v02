import { Settings, Layout } from 'lucide-react';
import PresentationTemplates from './PresentationTemplates';

interface AdvancedSettingsProps {
  slideCount: number;
  setSlideCount: (count: number) => void;
  designTemplate: string;
  setDesignTemplate: (template: string) => void;
  additionalInstructions: string;
  setAdditionalInstructions: (value: string) => void;
  isDarkMode: boolean;
}

export default function AdvancedSettings({
  slideCount,
  setSlideCount,
  designTemplate,
  setDesignTemplate,
  additionalInstructions,
  setAdditionalInstructions,
  isDarkMode,
}: AdvancedSettingsProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center mb-4">
        <Settings className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Advanced Settings
        </h3>
      </div>

      <div className="space-y-6">
        {/* Slide Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Slides
          </label>
          <div className="relative">
            <Layout className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="number"
              min="5"
              max="50"
              value={slideCount}
              onChange={(e) => setSlideCount(Math.max(5, Math.min(50, parseInt(e.target.value) || 5)))}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Minimum: 5 slides, Maximum: 50 slides
          </p>
        </div>

        {/* Design Template - Using the new PresentationTemplates component */}
        <PresentationTemplates 
          selectedTemplate={designTemplate}
          onSelectTemplate={setDesignTemplate}
          isDarkMode={isDarkMode}
        />

        {/* Additional Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Instructions
          </label>
          <textarea
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="Any specific requirements or preferences..."
          />
        </div>
      </div>
    </div>
  );
}