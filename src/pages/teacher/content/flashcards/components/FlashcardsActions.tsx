import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw } from 'lucide-react';
import { useFlashcards } from '../../../../../context/FlashcardsContext';
import { toast } from 'react-hot-toast';

export default function FlashcardsActions() {
  const navigate = useNavigate();
  const { flashcardSet } = useFlashcards();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!flashcardSet) {
    return null;
  }

  const handleDownload = () => {
    setIsDownloading(true);
    
    try {
      // Create a JSON blob with the flashcard data
      const flashcardData = JSON.stringify(flashcardSet, null, 2);
      const blob = new Blob([flashcardData], { type: 'application/json' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${flashcardSet.subject}-${flashcardSet.type}-flashcards.json`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Flashcards downloaded successfully');
    } catch (error) {
      console.error('Error downloading flashcards:', error);
      toast.error('Failed to download flashcards');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRegenerate = () => {
    // Navigate back to the generator page
    navigate('/teacher/content/flashcards');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Flashcards
            </>
          )}
        </button>
        
        <button
          onClick={handleRegenerate}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate
        </button>
      </div>
    </div>
  );
}