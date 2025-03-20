import { TemplateOption } from './PresentationTemplates';

interface TemplatedSlideProps {
  slide: {
    title: string;
    content: string[];
  };
  template: TemplateOption;
  isDarkMode: boolean;
}

export default function TemplatedSlide({ slide, template, isDarkMode }: TemplatedSlideProps) {
  // Apply dark mode adjustments
  const textColor = isDarkMode ? template.darkTextColor : template.textColor;
  const accentColor = isDarkMode ? template.darkAccentColor : template.accentColor;
  const backgroundColor = isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)';
  
  // Render different layouts based on template type
  const renderContent = () => {
    switch (template.layout) {
      case 'centered':
        return (
          <div 
            className="rounded-lg p-6 max-w-3xl mx-auto"
            style={{ 
              backgroundColor,
              fontFamily: template.fontFamily
            }}
          >
            <h3 
              className="text-2xl font-semibold mb-6 text-center"
              style={{ 
                color: textColor,
                borderBottom: `2px solid ${accentColor}`,
                paddingBottom: '0.5rem'
              }}
            >
              {slide.title}
            </h3>
            
            <div className="space-y-4">
              {slide.content.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 justify-center"
                >
                  <span 
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: accentColor }}
                  ></span>
                  <span style={{ color: textColor }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'left-aligned':
        return (
          <div 
            className="rounded-lg p-6"
            style={{ 
              backgroundColor,
              fontFamily: template.fontFamily
            }}
          >
            <h3 
              className="text-2xl font-semibold mb-6"
              style={{ 
                color: textColor,
                borderLeft: `4px solid ${accentColor}`,
                paddingLeft: '1rem'
              }}
            >
              {slide.title}
            </h3>
            
            <div className="space-y-4 ml-6">
              {slide.content.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3"
                >
                  <span 
                    className="w-3 h-3 rounded-sm mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: accentColor }}
                  ></span>
                  <span style={{ color: textColor }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'grid':
        // Adjust grid layout based on content length
        const contentLength = slide.content.length;
        const gridCols = contentLength > 4 ? 2 : 1; // Use single column for fewer items
        
        return (
          <div 
            className="rounded-lg p-4 overflow-auto max-h-full"
            style={{ 
              backgroundColor,
              fontFamily: template.fontFamily
            }}
          >
            <div className="relative mb-6 text-center">
              <span 
                className="text-xl md:text-2xl font-semibold mb-2 inline-block"
                style={{ 
                  color: textColor,
                  padding: '0 1rem'
                }}
              >
                {slide.title}
              </span>
              <div 
                className="w-full mt-2"
                style={{ 
                  background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
                  height: '2px'
                }}
              />
            </div>
            
            <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-3 md:gap-4 overflow-y-auto`} 
                 style={{ maxHeight: 'calc(100% - 80px)' }}>
              {slide.content.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start p-2 md:p-3 rounded-lg"
                  style={{ 
                    border: `1px solid ${accentColor}`,
                    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <span 
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full mr-2 md:mr-3 flex items-center justify-center text-xs flex-shrink-0"
                    style={{ 
                      backgroundColor: accentColor,
                      color: '#ffffff'
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ color: textColor, fontSize: '0.95rem' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div 
      className="w-full h-full rounded-lg overflow-hidden"
      style={{
        backgroundImage: `url(${template.backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}
    >
      <div 
        className="absolute inset-0 flex flex-col items-center p-4 md:p-6 lg:p-8 overflow-hidden"
        style={{ 
          backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.7)' : 'rgba(255, 255, 255, 0.2)',
          paddingTop: '60px'
        }}
      >
        <div className="w-full h-full overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
