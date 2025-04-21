import React from 'react';

/**
 * A component that processes markdown text and converts fraction patterns to proper fraction display
 * This can be used as a wrapper for markdown content or as a standalone component
 */
interface MarkdownFractionsProps {
  children: string;
  className?: string;
}

const MarkdownFractions: React.FC<MarkdownFractionsProps> = ({ children, className = '' }) => {
  // Process the text to replace fraction patterns with span elements
  const processedText = processFractions(children);
  
  return (
    <div className={`markdown-fractions ${className}`} dangerouslySetInnerHTML={{ __html: processedText }} />
  );
};

/**
 * Process text to replace fraction patterns with properly styled spans
 * Handles patterns like 1/2, 3/4, etc.
 */
export const processFractions = (text: string): string => {
  // Common fractions that have Unicode equivalents
  const commonFractions: Record<string, string> = {
    '1/2': '<span class="fraction frac-1-2"><span class="sr-only">1/2</span></span>',
    '1/3': '<span class="fraction frac-1-3"><span class="sr-only">1/3</span></span>',
    '2/3': '<span class="fraction frac-2-3"><span class="sr-only">2/3</span></span>',
    '1/4': '<span class="fraction frac-1-4"><span class="sr-only">1/4</span></span>',
    '3/4': '<span class="fraction frac-3-4"><span class="sr-only">3/4</span></span>',
    '1/5': '<span class="fraction frac-1-5"><span class="sr-only">1/5</span></span>',
    '2/5': '<span class="fraction frac-2-5"><span class="sr-only">2/5</span></span>',
    '3/5': '<span class="fraction frac-3-5"><span class="sr-only">3/5</span></span>',
    '4/5': '<span class="fraction frac-4-5"><span class="sr-only">4/5</span></span>',
    '1/6': '<span class="fraction frac-1-6"><span class="sr-only">1/6</span></span>',
    '5/6': '<span class="fraction frac-5-6"><span class="sr-only">5/6</span></span>',
    '1/8': '<span class="fraction frac-1-8"><span class="sr-only">1/8</span></span>',
    '3/8': '<span class="fraction frac-3-8"><span class="sr-only">3/8</span></span>',
    '5/8': '<span class="fraction frac-5-8"><span class="sr-only">5/8</span></span>',
    '7/8': '<span class="fraction frac-7-8"><span class="sr-only">7/8</span></span>',
  };

  // Replace common fractions with their Unicode equivalents
  let processedText = text;
  
  // Use regex to find fraction patterns that are not part of words
  // This will match patterns like "1/2" but not "a1/2" or "1/2b"
  const fractionRegex = /\b(\d+)\/(\d+)\b/g;
  
  processedText = processedText.replace(fractionRegex, (match) => {
    // If it's a common fraction, use the Unicode version
    if (commonFractions[match]) {
      return commonFractions[match];
    }
    
    // For other fractions, use OpenType fractions
    const [numerator, denominator] = match.split('/');
    return `<span class="fraction" aria-label="${numerator}/${denominator}">${match}</span>`;
  });
  
  return processedText;
};

export default MarkdownFractions;
