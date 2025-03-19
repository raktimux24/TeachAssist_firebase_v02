import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { QuestionSet, saveQuestionSetToFirestore } from '../../../../services/questionSetGeneration';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import '../../../../styles/markdown.css';
import { useAuth } from '../../../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/config';

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
  const [generationOptions, setGenerationOptions] = useState<any>(null);
  const [apiRequestData, setApiRequestData] = useState<any>(null);
  const [showGenerationDetails, setShowGenerationDetails] = useState(false);

  useEffect(() => {
    const loadQuestionSet = async () => {
      setLoading(true);
      
      // First, check if we have a questionSetId from props or URL params
      const firestoreQuestionSetId = questionSetId || urlQuestionSetId;
      
      if (firestoreQuestionSetId) {
        try {
          // Try to load the question set from Firestore
          setDebugInfo(`Attempting to load question set from Firestore with ID: ${firestoreQuestionSetId}`);
          const docRef = doc(db, 'questionsets', firestoreQuestionSetId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Get generation options and API request data if available
            if (data.generationOptions) {
              setGenerationOptions(data.generationOptions);
            }
            
            if (data.apiRequestData) {
              setApiRequestData(data.apiRequestData);
            }
            
            // Convert Firestore timestamps to Date objects
            const createdAt = data.createdAt?.toDate() || new Date();
            
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
            
            setQuestionSet(loadedQuestionSet);
            setShowAnswers(loadedQuestionSet.includeAnswers);
            setDebugInfo(prev => `${prev}\nSuccessfully loaded question set from Firestore with ${loadedQuestionSet.questions?.length || 0} questions`);
          } else {
            setDebugInfo(prev => `${prev}\nNo question set found in Firestore with ID: ${firestoreQuestionSetId}`);
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
          console.log('Parsed question set:', parsedQuestionSet);
          
          // Convert string dates back to Date objects
          if (typeof parsedQuestionSet.createdAt === 'string') {
            parsedQuestionSet.createdAt = new Date(parsedQuestionSet.createdAt);
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
        return;
      }
      
      // Add user ID to question set
      questionSet.userId = currentUser.uid;
      
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
        
        setDebugInfo(prev => `${prev}\nQuestion set saved to Firestore with ID: ${docRef.id}`);
        toast.success('Question set saved to your account');
      }
    } catch (error) {
      console.error('Error saving question set to Firestore:', error);
      setDebugInfo(prev => `${prev}\nError saving to Firestore: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleGoBack = () => {
    navigate('/teacher/content/question-sets');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleAnswers = () => {
    setShowAnswers(prev => !prev);
  };

  const handleDownload = () => {
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
    
    // Create a blob and download
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${questionSet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Question set downloaded successfully');
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

  const renderGenerationDetails = () => {
    if (!generationOptions && !apiRequestData) return null;
    
    return (
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => setShowGenerationDetails(!showGenerationDetails)}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generation Details
          </h3>
          <button className="text-gray-500 dark:text-gray-400">
            {showGenerationDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        
        {showGenerationDetails && (
          <div className="mt-4 space-y-4">
            {generationOptions && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Generation Options</h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <p><span className="font-medium">Class:</span> {generationOptions.class}</p>
                  <p><span className="font-medium">Subject:</span> {generationOptions.subject}</p>
                  <p><span className="font-medium">Chapters:</span> {generationOptions.chapters?.join(', ')}</p>
                  <p><span className="font-medium">Difficulty:</span> {generationOptions.difficulty}</p>
                  <p><span className="font-medium">Include Answers:</span> {generationOptions.includeAnswers ? 'Yes' : 'No'}</p>
                  
                  {generationOptions.questionTypes && (
                    <div>
                      <p className="font-medium">Question Types:</p>
                      <ul className="list-disc list-inside ml-2">
                        {Object.keys(generationOptions.questionTypes).map((type) => {
                          const count = Number(generationOptions.questionTypes[type]);
                          return count > 0 ? (
                            <li key={type}>{type}: {count}</li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  )}
                  
                  <p><span className="font-medium">Resources:</span> {generationOptions.resourceCount} resources used</p>
                </div>
              </div>
            )}
            
            {apiRequestData && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">API Request Data</h4>
                <div className="text-sm">
                  <div className="mb-2">
                    <p className="font-medium text-gray-900 dark:text-white">System Prompt:</p>
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {apiRequestData.systemPrompt}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">User Prompt:</p>
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {apiRequestData.userPrompt}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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
          Go Back
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
            <span>Back to Generator</span>
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
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          {questionSet.includeAnswers && (
            <button
              onClick={handleToggleAnswers}
              className={`flex items-center px-3 py-2 rounded-lg border font-medium ${
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
            className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Download className="h-4 w-4 mr-1" />
            <span>Download</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
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
              <ReactMarkdown>{question.question}</ReactMarkdown>
            </div>
            
            {question.type === 'mcq' && question.options && (
              <div className="space-y-2 mb-4">
                {question.options.map((option, optIndex) => (
                  <div 
                    key={optIndex} 
                    className={`p-3 rounded-lg border ${
                      showAnswers && question.answer === option
                        ? 'bg-primary-400/10 dark:bg-primary-700/20 border-primary-400/30 dark:border-primary-700/50'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-400/20 dark:bg-primary-700/30 text-primary-600 dark:text-white flex items-center justify-center mr-3">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="text-primary-600 dark:text-white">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {showAnswers && question.answer && (
              <div className="mt-4 p-4 bg-primary-400/10 dark:bg-primary-700/20 rounded-lg border border-primary-400/30 dark:border-primary-700/50">
                <h3 className="font-semibold text-primary-700 dark:text-white mb-2">Answer</h3>
                <div className="text-primary-600 dark:text-white">
                  <ReactMarkdown>{question.answer}</ReactMarkdown>
                </div>
                
                {question.explanation && (
                  <div className="mt-2 pt-2 border-t border-primary-400/30 dark:border-primary-700/50">
                    <h3 className="font-semibold text-primary-700 dark:text-white mb-1">Explanation</h3>
                    <div className="text-primary-600 dark:text-white">
                      <ReactMarkdown>{question.explanation}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Generation details section */}
      {renderGenerationDetails()}
      
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
