import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { testDailyContentStats, checkDailyStatsCollection } from '../../services/dailyContentStatsService';
import { updateContentStats } from '../../services/contentStatsService';
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

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto my-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Daily Stats Debugger</h2>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Daily Content Stats Debug Tools</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Use these tools to debug issues with daily content stats. This is for development purposes only.
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
              <ul className="list-disc pl-5">
                {results.map((result, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 mb-1">{result}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyStatsDebugger;
