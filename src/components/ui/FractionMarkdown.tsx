import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { processFractions } from './MarkdownFractions';

interface FractionMarkdownProps {
  children: string;
  className?: string;
}

/**
 * Enhanced ReactMarkdown component that properly renders fractions
 * This component pre-processes the markdown content to convert fraction patterns
 * to properly styled HTML elements before passing it to ReactMarkdown
 */
const FractionMarkdown: React.FC<FractionMarkdownProps> = ({ 
  children, 
  className = '' 
}) => {
  // Pre-process the markdown content to handle fractions
  const processedContent = processFractions(children);
  
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default FractionMarkdown;
