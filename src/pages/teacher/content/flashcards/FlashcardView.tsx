import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, Edit, Trash2 } from 'lucide-react';
import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import { getFlashcardSet, deleteFlashcardSet } from '../../../../firebase/flashcards';
import { useAuth } from '../../../../contexts/AuthContext';
import { useFlashcards } from '../../../../context/FlashcardsContext';
import { FlashcardSet } from '../../../../services/openai';
import FlashcardsPreview from './components/FlashcardsPreview';

interface FlashcardViewProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function FlashcardView({ isDarkMode, onThemeToggle }: FlashcardViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { setFlashcardSet } = useFlashcards();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashcardData, setFlashcardData] = useState<FlashcardSet & { id: string; userId: string; createdAt: any; updatedAt: any; generationOptions?: any }>(null as any);

  useEffect(() => {
    async function loadFlashcardSet() {
      if (!id) {
        setError('No flashcard set ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getFlashcardSet(id) as unknown as FlashcardSet & { id: string; userId: string; createdAt: any; updatedAt: any; generationOptions?: any };
        
        // Verify that the flashcard set belongs to the current user
        if (data.userId !== userInfo?.uid) {
          setError('You do not have permission to view this flashcard set');
          setLoading(false);
          return;
        }
        
        setFlashcardData(data);
        setFlashcardSet(data as unknown as FlashcardSet);
        setLoading(false);
      } catch (err) {
        console.error('Error loading flashcard set:', err);
        setError('Failed to load flashcard set. Please try again later.');
        setLoading(false);
      }
    }

    loadFlashcardSet();
    
    // Cleanup function
    return () => {
      setFlashcardSet(null);
    };
  }, [id, userInfo?.uid, setFlashcardSet]);

  const handleEdit = () => {
    navigate(`/teacher/content/flashcards/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this flashcard set? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      try {
        await deleteFlashcardSet(id);
        navigate('/teacher/flashcards');
      } catch (err) {
        console.error('Error deleting flashcard set:', err);
        alert('Failed to delete flashcard set. Please try again later.');
      }
    }
  };

  const handleDownload = () => {
    if (!flashcardData) return;
    
    // Format the flashcards for download
    const cards = flashcardData.cards.map((card: any) => ({
      front: card.front,
      back: card.back
    }));
    
    const dataStr = JSON.stringify({
      title: flashcardData.title,
      subject: flashcardData.subject,
      class: flashcardData.class,
      cards
    }, null, 2);
    
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `${flashcardData.title.replace(/\s+/g, '_')}_flashcards.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCopy = () => {
    if (!flashcardData) return;
    
    // Format the flashcards for copying
    const formattedCards = flashcardData.cards.map((card: any, index: number) => {
      return `Card ${index + 1}:\nFront: ${card.front}\nBack: ${card.back}\n`;
    }).join('\n');
    
    const textToCopy = `${flashcardData.title}\n\n${formattedCards}`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        alert('Flashcards copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy flashcards:', err);
        alert('Failed to copy flashcards to clipboard.');
      });
  };

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/teacher/flashcards')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? 'Loading Flashcard Set...' : flashcardData?.title || 'Flashcard Set'}
            </h1>
            {!loading && flashcardData && (
              <p className="text-gray-600 dark:text-gray-400">
                {flashcardData.subject} • {flashcardData.class} • {flashcardData.cards?.length || 0} cards
              </p>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => navigate('/teacher/flashcards')}
              className="mt-2 text-red-600 dark:text-red-400 font-medium hover:underline"
            >
              Return to Flashcards
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading flashcard set...</p>
          </div>
        )}

        {/* Content when loaded */}
        {!loading && !error && flashcardData && (
          <div className="space-y-6">
            {/* Action buttons */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 flex flex-wrap gap-3">
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </button>
            </div>

            {/* Flashcards preview */}
            <FlashcardsPreview />
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
