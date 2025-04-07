import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Copy, Check } from 'lucide-react';
import { QuestionSet, saveQuestionSetToFirestore } from '../../../../services/questionSetGeneration';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { toast } from 'react-hot-toast';
import '../../../../styles/markdown.css';
import { useAuth } from '../../../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import { generateDocument } from '../../../../services/documentGenerator';

interface QuestionSetResultsProps {
  isDarkMode: boolean;
  questionSetId?: string; // Optional ID to load question set directly from Firestore
}

export default function QuestionSetResults({ isDarkMode, questionSetId }: QuestionSetResultsProps) {
  const navigate = useNavigate();
  const { questionSetId: urlQuestionSetId } = useParams<{ questionSetId: string }>();
  const { currentUser } = useAuth();
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  // Generation details state variables removed as they're no longer needed

  useEffect(() => {
    const loadQuestionSet = async () => {
      setLoading(true);
      
      // First, check if we have a questionSetId from props or URL params
      const firestoreQuestionSetId = questionSetId || urlQuestionSetId;
      
      console.log('Loading question set with ID:', firestoreQuestionSetId);
      
      if (firestoreQuestionSetId) {
        try {
          // Try to load the question set from Firestore
          setDebugInfo(`Attempting to load question set from Firestore with ID: ${firestoreQuestionSetId}`);
          
          // Try different collection names for backward compatibility
          const collectionNames = ['questionsets', 'questionSet', 'questionset'];
          let docSnap = null;
          
          // Try each collection
          for (const collName of collectionNames) {
            try {
              console.log(`Trying to load from collection '${collName}'`);
              const docRef = doc(db, collName, firestoreQuestionSetId);
              const snapshot = await getDoc(docRef);
              
              if (snapshot.exists()) {
                docSnap = snapshot;
                console.log(`Found question set in collection '${collName}'`);
                setDebugInfo(prev => `${prev}\nFound question set in collection '${collName}'`);
                break;
              }
            } catch (collError) {
              console.warn(`Error loading from collection '${collName}':`, collError);
              // Continue to the next collection
            }
          }
          
          if (docSnap && docSnap.exists()) {
            const data = docSnap.data();
            
            // Generation options and API request data handling removed as they're no longer needed
            
            // Convert Firestore timestamps to Date objects, handling different formats
            let createdAt: Date;
            if (data.createdAt) {
              if (typeof data.createdAt.toDate === 'function') {
                // It's a Firestore timestamp
                createdAt = data.createdAt.toDate();
              } else if (data.createdAt instanceof Date) {
                // It's already a Date object
                createdAt = data.createdAt;
              } else if (typeof data.createdAt === 'string') {
                // It's a string date
                createdAt = new Date(data.createdAt);
              } else if (typeof data.createdAt === 'number') {
                // It's a timestamp in milliseconds
                createdAt = new Date(data.createdAt);
              } else {
                // Fallback to current date
                console.warn('Unknown createdAt format:', data.createdAt);
                createdAt = new Date();
              }
            } else {
              // No createdAt field
              createdAt = new Date();
            }
            
            // Create a QuestionSet object from the document data
            const loadedQuestionSet: QuestionSet = {
              title: data.title || '',
              subject: data.subject || '',
              class: data.class || '',
              chapters: data.chapters || [],
              difficulty: data.difficulty || 'medium',
              includeAnswers: data.includeAnswers !== undefined ? data.includeAnswers : true,
              questions: data.questions || [],
              createdAt: createdAt,
              userId: data.userId,
              firebaseId: docSnap.id
            };
            
            // Debug logging for questions and options
            console.log('Loaded question set from Firestore:', loadedQuestionSet);
            if (loadedQuestionSet.questions && loadedQuestionSet.questions.length > 0) {
              loadedQuestionSet.questions.forEach((q, i) => {
                console.log(`Question ${i+1} (${q.type}):`, q.question);
                if (q.type === 'mcq') {
                  console.log(`Options for Q${i+1}:`, q.options);
                  console.log(`Options type:`, q.options ? typeof q.options : 'undefined');
                  if (q.options && typeof q.options === 'string') {
                    const optionsString = q.options as string;
                    console.log(`Options string:`, optionsString);
                    // Try to parse string options
                    try {
                      if (optionsString.trim().startsWith('[') && optionsString.trim().endsWith(']')) {
                        q.options = JSON.parse(optionsString);
                        console.log(`Parsed options:`, q.options);
                      } else {
                        q.options = optionsString.split(/[,\n]/).map((opt: string) => opt.trim()).filter((opt: string) => opt);
                        console.log(`Split options:`, q.options);
                      }
                    } catch (e) {
                      console.error(`Error parsing options:`, e);
                    }
                  }
                }
              });
            }
            
            setQuestionSet(loadedQuestionSet);
            setShowAnswers(loadedQuestionSet.includeAnswers);
            setDebugInfo(prev => `${prev}\nSuccessfully loaded question set from Firestore with ${loadedQuestionSet.questions?.length || 0} questions`);
          } else {
            setDebugInfo(prev => `${prev}\nNo question set found in Firestore with ID: ${firestoreQuestionSetId}`);
            console.log('No question set found in any collection with ID:', firestoreQuestionSetId);
            // If not found in Firestore, fall back to localStorage
            loadFromLocalStorage();
          }
        } catch (error) {
          console.error('Error loading question set from Firestore:', error);
          setDebugInfo(prev => `${prev}\nError loading question set from Firestore: ${error instanceof Error ? error.message : String(error)}`);
          // Fall back to localStorage
          loadFromLocalStorage();
        }
      } else {
        // No Firestore ID provided, load from localStorage
        loadFromLocalStorage();
      }
      
      setLoading(false);
    };
    
    const loadFromLocalStorage = () => {
      // Load question set from localStorage
      const storedQuestionSet = localStorage.getItem('generatedQuestionSet');
      
      if (storedQuestionSet) {
        try {
          console.log('Raw stored question set:', storedQuestionSet);
          setDebugInfo(prev => `${prev}\nRaw stored question set length: ${storedQuestionSet.length}`);
          
          const parsedQuestionSet = JSON.parse(storedQuestionSet);
          console.log('Parsed question set from localStorage:', parsedQuestionSet);
          
          // Convert string dates back to Date objects
          if (typeof parsedQuestionSet.createdAt === 'string') {
            parsedQuestionSet.createdAt = new Date(parsedQuestionSet.createdAt);
          }
          
          // Debug logging for questions and options
          if (parsedQuestionSet.questions && parsedQuestionSet.questions.length > 0) {
            console.log(`Found ${parsedQuestionSet.questions.length} questions in localStorage`);
            parsedQuestionSet.questions.forEach((q: any, i: number) => {
              console.log(`Question ${i+1} (${q.type}):`, q.question);
              if (q.type === 'mcq') {
                console.log(`Options for Q${i+1}:`, q.options);
                console.log(`Options type:`, q.options ? typeof q.options : 'undefined');
                if (q.options && typeof q.options === 'string') {
                  const optionsString = q.options as string;
                  console.log(`Options string:`, optionsString);
                  // Try to parse string options
                  try {
                    if (optionsString.trim().startsWith('[') && optionsString.trim().endsWith(']')) {
                      q.options = JSON.parse(optionsString);
                      console.log(`Parsed options:`, q.options);
                    } else {
                      q.options = optionsString.split(/[,\n]/).map((opt: string) => opt.trim()).filter((opt: string) => opt);
                      console.log(`Split options:`, q.options);
                    }
                  } catch (e) {
                    console.error(`Error parsing options:`, e);
                  }
                }
              }
            });
          }
          
          // Ensure questions array exists and has content
          if (!parsedQuestionSet.questions || !Array.isArray(parsedQuestionSet.questions) || parsedQuestionSet.questions.length === 0) {
            console.error('Questions array is empty or invalid:', parsedQuestionSet.questions);
            setDebugInfo(prev => `${prev}\nQuestions array is empty or invalid: ${JSON.stringify(parsedQuestionSet.questions)}`);
            
            // Create a default question if none exists
            parsedQuestionSet.questions = [
              {
                id: '1',
                type: 'mcq',
                question: 'No content was generated. Please try again with different settings.',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                answer: 'Option A',
                explanation: 'This is a default question.'
              }
            ];
          }
          
          // Add user ID if available
          if (currentUser && !parsedQuestionSet.userId) {
            parsedQuestionSet.userId = currentUser.uid;
          }
          
          setQuestionSet(parsedQuestionSet);
          setShowAnswers(parsedQuestionSet.includeAnswers);
          setDebugInfo(prev => `${prev}\nQuestion set successfully loaded with ${parsedQuestionSet.questions?.length || 0} questions`);
          
          // If question set was loaded from localStorage and user is logged in, save to Firestore
          if (currentUser && !parsedQuestionSet.firebaseId) {
            saveToFirestore(parsedQuestionSet);
          }
        } catch (error) {
          console.error('Error parsing question set:', error);
          setDebugInfo(prev => `${prev}\nError parsing question set: ${error instanceof Error ? error.message : String(error)}`);
          toast.error('Failed to load generated question set');
        }
      } else {
        console.error('No stored question set found in localStorage');
        setDebugInfo('No stored question set found in localStorage');
        toast.error('No generated question set found');
      }
    };
    
    loadQuestionSet();
  }, [questionSetId, urlQuestionSetId, currentUser]);
  
  const saveToFirestore = async (questionSet: QuestionSet) => {
    try {
      if (!currentUser) {
        console.log('User not logged in, skipping Firestore save');
        setDebugInfo(prev => `${prev}\nUser not logged in, skipping Firestore save`);
        return;
      }
      
      // Add user ID to question set
      questionSet.userId = currentUser.uid;
      
      // Log the question set being saved
      console.log('Saving question set to Firestore:', JSON.stringify(questionSet, null, 2));
      setDebugInfo(prev => `${prev}\nAttempting to save question set to Firestore...`);
      
      // Save to Firestore
      const docRef = await saveQuestionSetToFirestore(questionSet);
      
      if (docRef) {
        // Update the question set with the Firestore ID
        setQuestionSet(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            firebaseId: docRef.id
          };
        });
        
        console.log('Question set saved successfully with ID:', docRef.id);
        setDebugInfo(prev => `${prev}\nQuestion set saved to Firestore with ID: ${docRef.id}`);
        toast.success('Question set saved to your account');
      } else {
        console.warn('No document reference returned from saveQuestionSetToFirestore');
        setDebugInfo(prev => `${prev}\nWarning: No document reference returned when saving to Firestore`);
      }
    } catch (error) {
      console.error('Error saving question set to Firestore:', error);
      setDebugInfo(prev => `${prev}\nError saving to Firestore: ${error instanceof Error ? error.message : String(error)}`);
      toast.error('Failed to save question set to your account');
    }
  };

  const handleGoBack = () => {
    navigate('/teacher/question-sets');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleAnswers = () => {
    setShowAnswers(prev => !prev);
  };

  const handleDownload = async () => {
    if (!questionSet) return;
    
    try {
      // Format question set data for document generation
      const sections = [];
      
      // Add metadata section
      sections.push({
        title: 'Question Set Information',
        content: [
          `Class: ${questionSet.class}`,
          `Subject: ${questionSet.subject}`,
          `Chapters: ${questionSet.chapters.join(', ')}`,
          `Difficulty: ${questionSet.difficulty}`
        ],
        type: 'text' as const
      });
      
      // Add each question as a section
      questionSet.questions.forEach((question, index) => {
        const questionContent = [];
        
        // Add question text
        questionContent.push(`${question.question}`);
        
        // Add options for MCQ questions
        if (question.type === 'mcq' && question.options) {
          question.options.forEach((option, optIndex) => {
            questionContent.push(`${String.fromCharCode(65 + optIndex)}. ${option}`);
          });
        }
        
        // Add answer and explanation if showAnswers is true (respecting the current toggle state)
        if (showAnswers && question.answer) {
          questionContent.push(`Answer: ${question.answer}`);
          
          if (question.explanation) {
            questionContent.push(`Explanation: ${question.explanation}`);
          }
        }
        
        // Add the question section
        sections.push({
          title: `Question ${index + 1} (${question.type})`,
          content: questionContent,
          type: question.type === 'mcq' ? 'key-point' : 
                question.type === 'true-false' ? 'definition' : 
                question.type === 'short-answer' ? 'formula' : 'text'
        } as const);
      });
      
      // Create document data
      const documentData = {
        title: questionSet.title,
        subject: questionSet.subject,
        class: questionSet.class,
        type: `Question Set (${questionSet.difficulty})`,
        layout: 'one-column',
        sections: sections
      };
      
      // Use the document generator service to create and download a Word document
      await generateDocument(documentData);
      toast.success('Question set downloaded as Word document');
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to download document. Please try again.');
    }
  };

  const handleCopyToClipboard = () => {
    if (!questionSet) return;
    
    // Create markdown content
    let markdownContent = `# ${questionSet.title}\n\n`;
    markdownContent += `Class: ${questionSet.class}\n`;
    markdownContent += `Subject: ${questionSet.subject}\n`;
    markdownContent += `Chapters: ${questionSet.chapters.join(', ')}\n`;
    markdownContent += `Difficulty: ${questionSet.difficulty}\n\n`;
    
    questionSet.questions.forEach((question, index) => {
      markdownContent += `## Question ${index + 1} (${question.type})\n\n`;
      markdownContent += `${question.question}\n\n`;
      
      if (question.type === 'mcq' && question.options) {
        question.options.forEach((option, optIndex) => {
          markdownContent += `${String.fromCharCode(65 + optIndex)}. ${option}\n`;
        });
        markdownContent += '\n';
      }
      
      if (questionSet.includeAnswers) {
        markdownContent += `**Answer:** ${question.answer}\n\n`;
        if (question.explanation) {
          markdownContent += `**Explanation:** ${question.explanation}\n\n`;
        }
      }
      
      markdownContent += '---\n\n';
    });
    
    navigator.clipboard.writeText(markdownContent)
      .then(() => {
        setCopied(true);
        toast.success('Question set copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy question set:', err);
        toast.error('Failed to copy question set to clipboard');
      });
  };

  // Generation details component function removed as requested

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDarkMode ? 'dark' : ''}`}>
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className={`text-center py-10 ${isDarkMode ? 'dark' : ''}`}>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">No Question Set Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn't find any generated question set. Please go back and generate a new question set.
        </p>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
        >
          Back
        </button>
        {debugInfo && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Debug Information:</h3>
            <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-64">
              {debugInfo}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {questionSet.title || 'Generated Question Set'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {questionSet.subject} • {questionSet.class} • {questionSet.chapters.join(', ')} • Difficulty: {questionSet.difficulty}
          </p>
          {questionSet.firebaseId && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Saved to your account • ID: {questionSet.firebaseId}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:flex sm:space-x-2 mt-4 md:mt-0">
          {questionSet.includeAnswers && (
            <button
              onClick={handleToggleAnswers}
              className={`flex items-center justify-center px-2 sm:px-3 py-2 rounded-lg border font-medium text-sm sm:text-base ${
                showAnswers 
                  ? 'bg-primary-100 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <span>{showAnswers ? 'Hide Answers' : 'Show Answers'}</span>
            </button>
          )}
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center justify-center px-2 sm:px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm sm:text-base"
          >
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center px-2 sm:px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm sm:text-base"
          >
            <Download className="h-4 w-4 mr-1" />
            <span>Download</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center px-2 sm:px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm sm:text-base"
          >
            <Printer className="h-4 w-4 mr-1" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questionSet.questions.map((question, index) => (
          <div key={question.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Question {index + 1}
              </h2>
              <span className="px-3 py-1 bg-primary-400/10 dark:bg-primary-700/20 text-primary-600 dark:text-primary-400 rounded-full text-sm capitalize">
                {question.type.replace('-', ' ')}
              </span>
            </div>
            
            <div className="prose dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-primary-600 dark:prose-p:text-white max-w-none mb-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{question.question}</ReactMarkdown>
            </div>
            
            {question.type === 'mcq' && (
              <div className="space-y-2 mb-4">
                {/* Debug info for troubleshooting */}
                {process.env.NODE_ENV !== 'production' && (
                  <div className="text-xs text-gray-500 mb-2">
                    Options type: {question.options ? (Array.isArray(question.options) ? 'array' : typeof question.options) : 'undefined'}
                    {question.options && !Array.isArray(question.options) && ` (value: ${JSON.stringify(question.options)})`}
                  </div>
                )}
                
                {/* Display MCQ options */}
                {question.options && Array.isArray(question.options) && question.options.map((option, optIndex) => {
                  // Handle different ways the correct answer might be specified
                  const optionValue = typeof option === 'string' ? option : JSON.stringify(option);
                  const answerValue = typeof question.answer === 'string' ? question.answer.trim() : '';
                  
                  // Check if this option is the correct answer in various formats
                  const isCorrectAnswer = showAnswers && (
                    // Exact match
                    answerValue === optionValue ||
                    // Option letter format (e.g., "A", "B", "C", "D")
                    answerValue === String.fromCharCode(65 + optIndex) ||
                    // Option letter with period (e.g., "A.", "B.", "C.", "D.")
                    answerValue === `${String.fromCharCode(65 + optIndex)}.` ||
                    // Option number (e.g., "1", "2", "3", "4")
                    answerValue === String(optIndex + 1) ||
                    // Answer contains the option text (only if option is reasonably long)
                    (optionValue.length > 5 && answerValue.includes(optionValue)) ||
                    // Option contains the answer (only if answer is reasonably long)
                    (answerValue.length > 5 && optionValue.includes(answerValue))
                  );
                  
                  return (
                    <div 
                      key={optIndex} 
                      className={`p-3 rounded-lg border ${
                        isCorrectAnswer
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full ${isCorrectAnswer ? 'bg-green-400/50 dark:bg-green-700/50 text-green-800 dark:text-green-100' : 'bg-primary-400/20 dark:bg-primary-700/30 text-primary-600 dark:text-white'} flex items-center justify-center mr-3`}>
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <div className="flex-1">
                          <span className={`${isCorrectAnswer ? 'font-medium text-green-800 dark:text-green-100' : 'text-primary-600 dark:text-white'}`}>
                            {optionValue}
                          </span>
                          {isCorrectAnswer && (
                            <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                              ✓ Correct Answer
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* For non-MCQ questions, show answer separately */}
            {showAnswers && question.answer && question.type !== 'mcq' && (
              <div className="mt-4 p-4 bg-primary-400/10 dark:bg-primary-700/20 rounded-lg border border-primary-400/30 dark:border-primary-700/50">
                <h3 className="font-semibold text-primary-700 dark:text-white mb-2">Answer</h3>
                <div className="text-primary-600 dark:text-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{question.answer}</ReactMarkdown>
                </div>
                
                {question.explanation && (
                  <div className="mt-2 pt-2 border-t border-primary-400/30 dark:border-primary-700/50">
                    <h3 className="font-semibold text-primary-700 dark:text-white mb-1">Explanation</h3>
                    <div className="text-primary-600 dark:text-white">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{question.explanation}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* For MCQ questions, show answer and explanation if present */}
            {showAnswers && question.type === 'mcq' && (question.explanation || question.answer) && (
              <div className="mt-4 p-4 bg-primary-400/10 dark:bg-primary-700/20 rounded-lg border border-primary-400/30 dark:border-primary-700/50">
                {/* Always show the answer for MCQ questions */}
                {question.answer && (
                  <>
                    <h3 className="font-semibold text-primary-700 dark:text-white mb-2">Answer</h3>
                    <div className="text-primary-600 dark:text-white mb-3">
                      <div className="flex items-center">
                        {/* Try to determine which option is correct */}
                        {(() => {
                          // Check if answer is a letter (A, B, C, D)
                          const answerStr = typeof question.answer === 'string' ? question.answer.trim() : '';
                          let letterMatch = null;
                          
                          // Check for single letter answer
                          if (/^[A-D]$/i.test(answerStr)) {
                            letterMatch = answerStr.toUpperCase().charCodeAt(0) - 65;
                          }
                          // Check for letter with period
                          else if (/^[A-D]\.$/.test(answerStr)) {
                            letterMatch = answerStr.toUpperCase().charCodeAt(0) - 65;
                          }
                          // Check for numeric answer
                          else if (/^[1-4]$/.test(answerStr)) {
                            letterMatch = parseInt(answerStr) - 1;
                          }
                          
                          if (letterMatch !== null && question.options && letterMatch < question.options.length) {
                            // Show the letter and the corresponding option
                            const letter = String.fromCharCode(65 + letterMatch);
                            const option = question.options[letterMatch];
                            return (
                              <>
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-400/50 dark:bg-green-700/50 text-green-800 dark:text-green-100 flex items-center justify-center mr-3">
                                  {letter}
                                </span>
                                <span className="font-medium">{option}</span>
                              </>
                            );
                          }
                          
                          // Default: just show the answer as is
                          return <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{question.answer}</ReactMarkdown>;
                        })()}
                      </div>
                    </div>
                  </>
                )}
                
                {/* Show explanation if present */}
                {question.explanation && (
                  <>
                    <h3 className="font-semibold text-primary-700 dark:text-white mb-2">Explanation</h3>
                    <div className="text-primary-600 dark:text-white">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{question.explanation}</ReactMarkdown>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Generation details section removed as requested */}
      
      {/* Debug information in development mode - hidden from UI */}
      {/* {process.env.NODE_ENV !== 'production' && debugInfo && (
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Debug Information:</h3>
          <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-64">
            {debugInfo}
          </pre>
        </div>
      )} */}
    </div>
  );
}
