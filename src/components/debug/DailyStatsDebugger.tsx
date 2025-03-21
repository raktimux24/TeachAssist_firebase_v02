import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { testDailyContentStats, checkDailyStatsCollection } from '../../services/dailyContentStatsService';
import { updateContentStats } from '../../services/contentStatsService';
import { testOpenAIConnection } from '../../services/presentationService';
import { generateContent } from '../../services/aiService';
import toast from 'react-hot-toast';

/**
 * Debug component for testing daily content stats functionality
 * This component is for development purposes only
 */
const DailyStatsDebugger = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleRunTest = async () => {
    if (!currentUser?.uid) {
      toast.error('You must be logged in to run this test');
      return;
    }

    setLoading(true);
    addResult('Starting test...');

    try {
      await testDailyContentStats(currentUser.uid);
      addResult('Test completed successfully!');
    } catch (error) {
      addResult(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCollection = async () => {
    setLoading(true);
    addResult('Checking collection...');

    try {
      await checkDailyStatsCollection();
      addResult('Collection check completed');
    } catch (error) {
      addResult(`Collection check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualUpdate = async () => {
    if (!currentUser?.uid) {
      toast.error('You must be logged in to update stats');
      return;
    }

    setLoading(true);
    addResult('Updating content stats manually...');

    try {
      await updateContentStats(currentUser.uid, {
        type: 'notes',
        operation: 'increment'
      });
      addResult('Manual update completed successfully!');
    } catch (error) {
      addResult(`Manual update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testOpenAIWithFallback = async () => {
    setLoading(true);
    addResult('Testing OpenAI API with Gemini fallback...');

    try {
      // First test the API connection
      const connectionResult = await testOpenAIConnection();
      
      // Format the connection result in a more readable way
      if (connectionResult.success) {
        addResult(`✅ API Connection successful: Using ${connectionResult.provider.toUpperCase()} as the provider`);
        
        if (connectionResult.provider === 'gemini') {
          addResult(`ℹ️ Note: Using Gemini as fallback because OpenAI API is unavailable`);
          if (connectionResult.message.includes('billing')) {
            addResult(`⚠️ OpenAI billing issue detected: Your OpenAI account is not active. Please check your billing details.`);
          }
        }
        
        // Now try to actually generate some content
        const testPrompt = 'Generate a short paragraph about education technology.';
        addResult('Generating test content...');
        
        try {
          const content = await generateContent(
            'You are a helpful assistant for teachers.',
            testPrompt,
            { maxTokens: 100 }
          );
          
          addResult('✅ Content generation successful!');
          addResult(`Generated content: "${content.substring(0, 100)}..."`);
        } catch (genError) {
          const errorMessage = genError instanceof Error ? genError.message : String(genError);
          addResult(`❌ Content generation failed: ${errorMessage}`);
          
          if (errorMessage.includes('billing') || errorMessage.includes('account is not active')) {
            addResult(`⚠️ OpenAI billing issue: Your OpenAI account is not active. The application will use Gemini API as a fallback.`);
            addResult(`ℹ️ Action required: Please check your OpenAI account billing status at https://platform.openai.com/account/billing`);
          }
        }
      } else {
        addResult(`❌ API connection failed: ${connectionResult.message}`);
        
        if (connectionResult.message.includes('billing') || connectionResult.message.includes('account is not active')) {
          addResult(`⚠️ OpenAI billing issue: Your OpenAI account is not active. The application will use Gemini API as a fallback.`);
          addResult(`ℹ️ Action required: Please check your OpenAI account billing status at https://platform.openai.com/account/billing`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addResult(`❌ API test failed: ${errorMessage}`);
      
      if (errorMessage.includes('billing') || errorMessage.includes('account is not active')) {
        addResult(`⚠️ OpenAI billing issue: Your OpenAI account is not active. The application will use Gemini API as a fallback.`);
        addResult(`ℹ️ Action required: Please check your OpenAI account billing status at https://platform.openai.com/account/billing`);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto my-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Diagnostics</h2>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">AI Services & Daily Content Stats Debug Tools</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Use these tools to test AI services (OpenAI/Gemini fallback) and debug issues with daily content stats. This is for development purposes only.
        </p>

        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleRunTest} 
            disabled={loading}
          >
            {loading ? 'Running...' : 'Run Test'}
          </button>
          <button 
            className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleCheckCollection} 
            disabled={loading}
          >
            Check Collection
          </button>
          <button 
            className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleManualUpdate} 
            disabled={loading}
          >
            Manual Update
          </button>
          <div className="relative group">
            <button 
              className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors font-medium flex items-center space-x-1 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={testOpenAIWithFallback} 
              disabled={loading}
              title="Test OpenAI API with Gemini fallback"
            >
              <span>Test AI Fallback</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-64 pointer-events-none">
              Tests OpenAI API connectivity and falls back to Gemini API if OpenAI is unavailable. Helps diagnose billing issues.
            </div>
          </div>
          <button 
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={clearResults}
          >
            Clear Results
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Test Results</h4>
          <div className="max-h-80 overflow-auto">
            {results.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No results yet. Run a test to see results.</p>
            ) : (
              <ul className="list-none pl-2">
                {results.map((result, index) => {
                  let className = "text-gray-700 dark:text-gray-300 mb-2 pb-1";
                  
                  // Apply different styling based on message content
                  if (result.includes('❌')) {
                    className = "text-red-600 dark:text-red-400 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700";
                  } else if (result.includes('⚠️')) {
                    className = "text-amber-600 dark:text-amber-400 mb-2 pb-1 font-medium";
                  } else if (result.includes('ℹ️')) {
                    className = "text-blue-600 dark:text-blue-400 mb-2 pb-1";
                  } else if (result.includes('✅')) {
                    className = "text-green-600 dark:text-green-400 mb-2 pb-1 font-medium";
                  }
                  
                  return <li key={index} className={className}>{result}</li>;
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyStatsDebugger;
