import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentTypeItem } from '../../../types/dashboard';
import { DashboardCard } from '../../shared/cards/DashboardCard';

interface ContentGenerationSectionProps {
  contentTypes: ContentTypeItem[];
}

export const ContentGenerationSection: React.FC<ContentGenerationSectionProps> = ({ contentTypes }) => {
  const navigate = useNavigate();

  return (
    <DashboardCard>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Content Generation
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentTypes.map((content) => {
          const Icon = content.icon;
          return (
            <div 
              key={content.title} 
              onClick={() => navigate(content.route)}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mr-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {content.title}
                </h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {content.description}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end">
        <button 
          onClick={() => navigate('/teacher/content')} 
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          View all content options
        </button>
      </div>
    </DashboardCard>
  );
}; 