import React from 'react';
import Fraction from './Fraction';

/**
 * Demo component to showcase the different ways to display fractions
 */
const FractionDemo: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Fraction Display Options</h2>
      
      <div className="space-y-6">
        {/* Unicode Fractions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Unicode Fractions</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            These use built-in Unicode characters for common fractions:
          </p>
          <div className="flex flex-wrap gap-4 text-lg">
            <div className="flex items-center gap-2">
              <Fraction numerator={1} denominator={2} useUnicode={true} />
              <span className="text-gray-500 dark:text-gray-400">1/2</span>
            </div>
            <div className="flex items-center gap-2">
              <Fraction numerator={1} denominator={4} useUnicode={true} />
              <span className="text-gray-500 dark:text-gray-400">1/4</span>
            </div>
            <div className="flex items-center gap-2">
              <Fraction numerator={3} denominator={4} useUnicode={true} />
              <span className="text-gray-500 dark:text-gray-400">3/4</span>
            </div>
            <div className="flex items-center gap-2">
              <Fraction numerator={1} denominator={3} useUnicode={true} />
              <span className="text-gray-500 dark:text-gray-400">1/3</span>
            </div>
            <div className="flex items-center gap-2">
              <Fraction numerator={2} denominator={3} useUnicode={true} />
              <span className="text-gray-500 dark:text-gray-400">2/3</span>
            </div>
          </div>
        </div>
        
        {/* OpenType Fractions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">OpenType Fractions</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            These use the font's OpenType features to display any fraction:
          </p>
          <div className="flex flex-wrap gap-4 text-lg">
            <div className="flex items-center gap-2">
              <Fraction numerator={5} denominator={9} useUnicode={false} />
              <span className="text-gray-500 dark:text-gray-400">5/9</span>
            </div>
            <div className="flex items-center gap-2">
              <Fraction numerator={7} denominator={12} useUnicode={false} />
              <span className="text-gray-500 dark:text-gray-400">7/12</span>
            </div>
            <div className="flex items-center gap-2">
              <Fraction numerator={11} denominator={16} useUnicode={false} />
              <span className="text-gray-500 dark:text-gray-400">11/16</span>
            </div>
          </div>
        </div>
        
        {/* Inline Usage */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Inline Usage Example</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            In mathematics, we often need to display fractions in text. For example, if we mix 
            <Fraction numerator={1} denominator={2} className="mx-1" /> cup of flour with 
            <Fraction numerator={3} denominator={4} className="mx-1" /> cup of milk, we get 
            <Fraction numerator={1} denominator={4} className="mx-1" /> more than 1 cup of mixture.
          </p>
        </div>
        
        {/* Math Expressions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Mathematical Expressions</h3>
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md font-literata text-lg">
            <p className="text-center">
              <span className="mr-2">If</span>
              <span>x = </span>
              <Fraction numerator={3} denominator={4} className="mx-1" />
              <span className="mx-2">and</span>
              <span>y = </span>
              <Fraction numerator={1} denominator={2} className="mx-1" />
              <span className="mx-2">then</span>
              <span>x + y = </span>
              <Fraction numerator={5} denominator={4} className="mx-1" />
              <span className="mx-2">or</span>
              <span>1</span>
              <Fraction numerator={1} denominator={4} className="ml-1" />
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Usage in Code</h3>
        <pre className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md overflow-x-auto text-sm">
          <code className="text-gray-800 dark:text-gray-200">
{`// Import the component
import Fraction from '../components/ui/Fraction';

// Use in your JSX
<Fraction numerator={1} denominator={2} />

// For non-Unicode fractions
<Fraction numerator={7} denominator={15} useUnicode={false} />

// With additional styling
<Fraction numerator={3} denominator={4} className="text-blue-600 text-xl" />`}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default FractionDemo;
