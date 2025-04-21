import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { InlineMath, BlockMath } from 'react-katex';
import { processFractions } from './MarkdownFractions';
import '../../styles/katex.css';

// Regular expressions for matching LaTeX expressions
const INLINE_MATH_REGEX = /\$((?:\\.|[^\$])*)\$/g;
const BLOCK_MATH_REGEX = /\$\$((?:\\.|[^\$])*)\$\$/g;

interface MathMarkdownProps {
  children: string;
  className?: string;
}

/**
 * Enhanced ReactMarkdown component that properly renders both fractions and LaTeX math expressions
 * This component supports:
 * - Regular fractions like 1/2 (converted to ½)
 * - Inline LaTeX math expressions like $\frac{7}{-3}$
 * - Block LaTeX math expressions like $$\frac{-7}{3}$$
 */
const MathMarkdown: React.FC<MathMarkdownProps> = ({ 
  children, 
  className = '' 
}) => {
  // Process the content to render LaTeX expressions directly
  const renderedContent = renderMathExpressions(children);
  
  return (
    <div className={`markdown-content ${className}`}>
      {renderedContent}
    </div>
  );
};

/**
 * Render LaTeX math expressions directly in the content
 * This function processes the content in three steps:
 * 1. Split the content by block math expressions ($$...$$)
 * 2. For each non-math segment, split by inline math expressions ($...$)
 * 3. For each non-math segment, process regular fractions
 */
const renderMathExpressions = (content: string): React.ReactNode[] => {
  const result: React.ReactNode[] = [];
  let key = 0;
  
  // Split by block math expressions first
  const blockParts = content.split(BLOCK_MATH_REGEX);
  
  for (let i = 0; i < blockParts.length; i++) {
    if (i % 2 === 0) {
      // This is a non-block-math segment (might contain inline math)
      const inlineParts = blockParts[i].split(INLINE_MATH_REGEX);
      
      for (let j = 0; j < inlineParts.length; j++) {
        if (j % 2 === 0) {
          // This is a regular text segment (might contain fractions)
          if (inlineParts[j].trim()) {
            const processedText = processFractions(inlineParts[j]);
            result.push(
              <ReactMarkdown 
                key={`text-${key++}`}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {processedText}
              </ReactMarkdown>
            );
          }
        } else {
          // This is an inline math expression
          result.push(
            <InlineMath key={`inline-math-${key++}`} math={inlineParts[j]} />
          );
        }
      }
    } else {
      // This is a block math expression
      result.push(
        <BlockMath key={`block-math-${key++}`} math={blockParts[i]} />
      );
    }
  }
  
  return result;
};

export default MathMarkdown;
