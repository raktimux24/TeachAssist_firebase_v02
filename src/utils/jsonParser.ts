/**
 * Utility functions for parsing and validating JSON responses from AI services
 */

/**
 * Attempts to parse a string as JSON using multiple strategies
 * @param content - The string content to parse
 * @returns The parsed JSON object or null if parsing fails
 */
export const parseJsonResponse = <T>(content: string): T | null => {
  if (!content) {
    console.warn('Empty content provided to parseJsonResponse');
    return null;
  }
  
  try {
    // Strategy 1: Direct JSON parsing if content is already valid JSON
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      try {
        const parsedContent = JSON.parse(content);
        console.log('Successfully parsed JSON directly');
        return parsedContent;
      } catch (directParseError) {
        console.warn('Direct JSON parsing failed:', directParseError);
      }
    }
    
    // Strategy 2: Extract JSON from markdown code blocks
    if (content.includes('```json') || content.includes('```')) {
      try {
        let cleanedContent = content;
        
        // Extract content between ```json and ``` markers (most specific first)
        const jsonBlockMatch = content.match(/```json\s*\n([\s\S]*?)\n\s*```/);
        if (jsonBlockMatch && jsonBlockMatch[1]) {
          cleanedContent = jsonBlockMatch[1].trim();
          
          // Check if the extracted content starts and ends with braces
          if (cleanedContent.startsWith('{') && cleanedContent.endsWith('}')) {
            // Remove any control characters that might cause JSON parsing to fail
            cleanedContent = cleanedContent.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
            
            try {
              const parsedContent = JSON.parse(cleanedContent);
              console.log('Successfully parsed JSON from json code block');
              return parsedContent;
            } catch (jsonBlockError) {
              console.warn('JSON block parsing failed:', jsonBlockError);
            }
          }
        }
        
        // Try with just ``` markers (any code block)
        const codeBlockMatches = content.matchAll(/```(?:json)?\s*\n([\s\S]*?)\n\s*```/g);
        for (const match of Array.from(codeBlockMatches)) {
          if (match && match[1]) {
            const blockContent = match[1].trim();
            
            // Check if this block looks like JSON
            if (blockContent.startsWith('{') && blockContent.endsWith('}')) {
              try {
                // Remove any control characters
                const cleanBlock = blockContent.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
                const parsedContent = JSON.parse(cleanBlock);
                console.log('Successfully parsed JSON from code block');
                return parsedContent;
              } catch (blockError) {
                console.warn('Code block parsing attempt failed');
              }
            }
          }
        }
        
        // If no successful match with specific regex, try simple replacement as last resort
        cleanedContent = content
          .replace(/```json\s*\n/g, '')
          .replace(/```\s*\n/g, '')
          .replace(/\n\s*```/g, '')
          .trim();
        
        // Only try to parse if it looks like JSON
        if (cleanedContent.startsWith('{') && cleanedContent.endsWith('}')) {
          // Remove any control characters
          cleanedContent = cleanedContent.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
          
          try {
            const parsedContent = JSON.parse(cleanedContent);
            console.log('Successfully parsed JSON after code block cleanup');
            return parsedContent;
          } catch (cleanupError) {
            console.warn('Cleaned code block parsing failed:', cleanupError);
          }
        }
      } catch (codeBlockParseError) {
        console.warn('Code block JSON parsing failed:', codeBlockParseError);
      }
    }
    
    // Strategy 3: Extract JSON using regex - look for the largest JSON-like structure
    try {
      // Find all potential JSON objects in the content
      const jsonMatches = Array.from(content.matchAll(/\{[\s\S]*?\}/g));
      
      // Sort by length (descending) to try the largest JSON-like structure first
      const sortedMatches = jsonMatches
        .map(match => match[0])
        .sort((a, b) => b.length - a.length);
      
      for (const jsonContent of sortedMatches) {
        try {
          // Only process if it looks like a substantial JSON object (not just "{}")
          if (jsonContent.length > 10) {
            // Remove any control characters that might cause JSON parsing to fail
            const cleanedJson = jsonContent.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
            
            const parsedContent = JSON.parse(cleanedJson);
            console.log('Successfully parsed JSON using regex extraction');
            return parsedContent;
          }
        } catch (individualJsonError) {
          // Continue to the next match if this one fails
          continue;
        }
      }
      
      console.warn('No valid JSON objects found using regex extraction');
    } catch (regexParseError) {
      console.warn('Regex JSON parsing failed:', regexParseError);
    }
    
    // Strategy 4: Fix common JSON syntax errors and try again
    try {
      // First, try to extract what looks like JSON content
      let fixedContent = content;
      
      // If content contains 'json' followed by a JSON-like structure, extract that part
      const jsonPrefixMatch = content.match(/json\s*\n\s*(\{[\s\S]*\})/i);
      if (jsonPrefixMatch && jsonPrefixMatch[1]) {
        fixedContent = jsonPrefixMatch[1];
      }
      
      // Remove any control characters that might cause JSON parsing to fail
      fixedContent = fixedContent.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      
      // Replace single quotes with double quotes (common error)
      fixedContent = fixedContent.replace(/'/g, '"');
      
      // Fix unquoted property names
      fixedContent = fixedContent.replace(/(\{|\,)\s*(\w+)\s*\:/g, '$1"$2":');
      
      // Fix trailing commas in arrays and objects
      fixedContent = fixedContent.replace(/,\s*(\}|\])/g, '$1');
      
      // Fix missing quotes around string values
      fixedContent = fixedContent.replace(/:\s*([^\s\{\}\[\]\,\"\d][^\,\}\]]*?)\s*(\,|\}|\])/g, ':"$1"$2');
      
      // Fix specific issues with escaped quotes in string values
      fixedContent = fixedContent.replace(/:\s*"([^"]*)\"([^"]*)"(\s*,|\s*\}|\s*\])/g, ':"$1\\"$2"$3');

      // Fix bad escaped characters in JSON strings (handles backslashes followed by invalid escape chars)
      fixedContent = fixedContent.replace(/([^\\])\\([^"\\nrtbfux\/])/g, '$1\\\\$2');
      
      // Fix newlines and tabs in string values
      fixedContent = fixedContent.replace(/:\s*"([^"]*)(\n|\t)([^"]*)"(\s*,|\s*\}|\s*\])/g, ':"$1 $3"$4');
      
      // Fix asterisks in string values (common in markdown)
      fixedContent = fixedContent.replace(/:\s*"([^"]*)\*\*([^"]*)\*\*([^"]*)"(\s*,|\s*\}|\s*\])/g, ':"$1**$2**$3"$4');
      
      // Attempt to fix the specific error at position ~12329
      try {
        // Try parsing as is first
        return JSON.parse(fixedContent);
      } catch (initialError) {
        if (initialError instanceof SyntaxError && initialError.message.includes('position')) {
          // Extract position from error message
          const posMatch = initialError.message.match(/position (\d+)/);
          if (posMatch && posMatch[1]) {
            const errorPos = parseInt(posMatch[1]);
            console.log(`Attempting to fix JSON error at position ${errorPos}`);
            
            // Look at the problematic area (20 chars before and after)
            const start = Math.max(0, errorPos - 20);
            const end = Math.min(fixedContent.length, errorPos + 20);
            const problemArea = fixedContent.substring(start, end);
            console.log(`Problem area: ${problemArea}`);
            
            // Try to fix common issues at the error position
            const problemChar = fixedContent.charAt(errorPos);
            let fixedForPosition = fixedContent;
            
            if (problemChar === '"' || problemChar === "'") {
              // Might be an unescaped quote in a string
              fixedForPosition = fixedContent.substring(0, errorPos) + '\\' + fixedContent.substring(errorPos);
            } else if (problemChar === '*' || problemChar === '_') {
              // Might be markdown formatting
              fixedForPosition = fixedContent.substring(0, errorPos) + ' ' + fixedContent.substring(errorPos + 1);
            } else if (problemChar === '\\') {
              // Check if this is a bad escape sequence
              const nextChar = fixedContent.charAt(errorPos + 1);
              if (!/["\\nrtbfux\/]/.test(nextChar)) {
                // This is likely a bad escape sequence - double the backslash
                fixedForPosition = fixedContent.substring(0, errorPos) + '\\\\' + fixedContent.substring(errorPos + 1);
              } else {
                // Try removing the problematic character
                fixedForPosition = fixedContent.substring(0, errorPos) + fixedContent.substring(errorPos + 1);
              }
            } else {
              // Try removing the problematic character
              fixedForPosition = fixedContent.substring(0, errorPos) + fixedContent.substring(errorPos + 1);
            }
            
            try {
              return JSON.parse(fixedForPosition);
            } catch (positionFixError) {
              console.warn('Position-specific fix failed:', positionFixError);
            }
          }
        }
      }
      
      // If we got here, try a more aggressive approach: truncate at the error position
      try {
        // Find the last complete object before any potential error
        const lastCompleteObjectMatch = fixedContent.match(/(\{[^\{\}]*\})/g);
        if (lastCompleteObjectMatch && lastCompleteObjectMatch.length > 0) {
          // Use the last (and hopefully largest) complete object
          const lastObject = lastCompleteObjectMatch[lastCompleteObjectMatch.length - 1];
          console.log('Attempting to parse last complete object');
          return JSON.parse(lastObject);
        }
      } catch (truncateError) {
        console.warn('Truncation approach failed:', truncateError);
      }
      
      // Last resort: try with a more lenient JSON parser
      try {
        // Use a more lenient approach: eval with safety checks
        const safeEval = (str: string) => {
          // Only allow if it looks like a JSON object
          if (/^\s*\{[\s\S]*\}\s*$/.test(str)) {
            // Convert to a proper JSON string first
            const jsonStr = str
              .replace(/([\{\,])\s*([\w\d]+)\s*:/g, '$1"$2":') // Fix unquoted property names
              .replace(/:\s*'([^']*)'\s*(,|\})/g, ':"$1"$2'); // Fix single quotes
            
            return JSON.parse(jsonStr);
          }
          throw new Error('Unsafe eval attempt rejected');
        };
        
        return safeEval(fixedContent);
      } catch (lenientError) {
        console.warn('Lenient parsing failed:', lenientError);
      }
      
      // If we reach here, all parsing attempts have failed
      console.warn('All JSON parsing attempts failed');
      return null;
    } catch (fixedParseError) {
      console.warn('Fixed JSON parsing failed:', fixedParseError);
    }
    
    // Strategy 5: Extract structured data from markdown content
    try {
      // Look for structured data in markdown format
      const structuredData: Record<string, any> = {};
      
      // Extract title from markdown headers
      const titleMatch = content.match(/^#\s+(.+?)\s*$/m) || content.match(/^\s*Title:\s*(.+?)\s*$/m);
      if (titleMatch && titleMatch[1]) {
        structuredData.title = titleMatch[1].trim();
      }
      
      // Extract sections from markdown headers
      const sections: Array<{id: string; title: string; content: string}> = [];
      const sectionMatches = content.matchAll(/^##\s+(.+?)\s*$(\n[\s\S]*?)(?=^##\s+|$)/gm);
      
      let sectionIndex = 0;
      for (const match of Array.from(sectionMatches)) {
        if (match && match[1] && match[2]) {
          sections.push({
            id: (sectionIndex + 1).toString(),
            title: match[1].trim(),
            content: match[2].trim()
          });
          sectionIndex++;
        }
      }
      
      if (sections.length > 0) {
        structuredData.sections = sections;
      }
      
      // Only return if we extracted meaningful data
      if (Object.keys(structuredData).length > 0) {
        console.log('Successfully extracted structured data from markdown');
        return structuredData as unknown as T;
      }
    } catch (markdownError) {
      console.warn('Markdown extraction failed:', markdownError);
    }
    
    // All strategies failed
    console.error('All JSON parsing strategies failed');
    return null;
  } catch (error) {
    console.error('Error in parseJsonResponse:', error);
    return null;
  }
};

/**
 * Validates that a parsed object has all required fields and adds defaults for missing ones
 * @param parsedContent - The parsed object to validate
 * @param requiredFields - Map of field names to their default values
 * @returns The validated object with all required fields
 */
export const validateAndFixJsonObject = <T>(
  parsedContent: Partial<T> | null, 
  requiredFields: Partial<Record<keyof T, any>>
): T => {
  if (!parsedContent) {
    console.warn('Creating default object from required fields');
    return { ...requiredFields } as T;
  }
  
  const result = { ...parsedContent } as T;
  let missingFields = false;
  
  // Check for missing fields and add defaults
  for (const [field, defaultValue] of Object.entries(requiredFields)) {
    const typedField = field as keyof T;
    if (result[typedField] === undefined) {
      // Type assertion to ensure compatibility
      result[typedField] = defaultValue as T[keyof T];
      missingFields = true;
    }
  }
  
  if (missingFields) {
    console.log('Added default values for missing fields in JSON object');
  }
  
  return result;
};

/**
 * Extracts a value from a string using a regex pattern
 * Useful for extracting specific fields when JSON parsing fails completely
 * @param content - The string content to extract from
 * @param fieldName - The name of the field to extract
 * @param defaultValue - The default value if extraction fails
 * @returns The extracted value or the default
 */
export const extractFieldFromString = (
  content: string,
  fieldName: string,
  defaultValue: string
): string => {
  try {
    // Try to match field in JSON format: "fieldName": "value" or 'fieldName': 'value'
    const pattern = new RegExp(`["']?${fieldName}["']?\\s*:\\s*["']([^"']+)["']`);
    const match = content.match(pattern);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return defaultValue;
  } catch (error) {
    console.warn(`Failed to extract ${fieldName} from string:`, error);
    return defaultValue;
  }
};
