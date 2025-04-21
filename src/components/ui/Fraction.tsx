import React from 'react';

interface FractionProps {
  numerator: number;
  denominator: number;
  className?: string;
  useUnicode?: boolean;
}

/**
 * Fraction component that displays fractions in a typographically correct way
 * 
 * @param numerator - The top number in the fraction
 * @param denominator - The bottom number in the fraction
 * @param className - Additional CSS classes to apply
 * @param useUnicode - Whether to use Unicode fraction characters (if available)
 */
const Fraction: React.FC<FractionProps> = ({
  numerator,
  denominator,
  className = '',
  useUnicode = true
}) => {
  // Check if we can use a Unicode fraction character
  const unicodeFractionClass = `frac-${numerator}-${denominator}`;
  const hasUnicodeVersion = [
    '1-2', '1-3', '2-3', '1-4', '3-4', '1-5', '2-5', '3-5', '4-5',
    '1-6', '5-6', '1-8', '3-8', '5-8', '7-8'
  ].includes(`${numerator}-${denominator}`);

  // Use Unicode if available and requested
  if (useUnicode && hasUnicodeVersion) {
    return (
      <span className={`${unicodeFractionClass} font-fraction ${className}`} aria-label={`${numerator}/${denominator}`}>
        <span className="sr-only">{numerator}/{denominator}</span>
      </span>
    );
  }

  // Use OpenType fractions if browser supports it
  return (
    <span className={`fraction ${className}`} aria-label={`${numerator}/${denominator}`}>
      {/* Primary method using OpenType features */}
      <span className="hidden sm:inline">{numerator}/{denominator}</span>
      
      {/* Fallback for mobile or browsers without OpenType support */}
      <span className="fraction-fallback sm:hidden">
        <span className="numerator">{numerator}</span>
        <span className="fraction-line"></span>
        <span className="denominator">{denominator}</span>
      </span>
    </span>
  );
};

export default Fraction;
