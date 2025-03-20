import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import { getFlashcardSet, updateFlashcardSet } from '../../../../firebase/flashcards';
import { useAuth } from '../../../../contexts/AuthContext';
import { FlashcardSet, Flashcard } from '../../../../services/openai';

interface FlashcardEditProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

interface FlashcardItem extends Partial<Flashcard> {
  front: string;
  back: string;
  type?: string;
}

export default function FlashcardEdit({ isDarkMode, onThemeToggle }: FlashcardEditProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcardData, setFlashcardData] = useState<FlashcardSet & { id: string; userId: string; createdAt: any; updatedAt: any; generationOptions?: any }>(null as any);
  
  // Form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);

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
          setError('You do not have permission to edit this flashcard set');
          setLoading(false);
          return;
        }
        
        setFlashcardData(data);
        
        // Initialize form state
        setTitle(data.title || '');
        setSubject(data.subject || '');
        setClassName(data.class || '');
        setFlashcards(data.flashcards?.map((card: Flashcard) => ({ 
          id: card.id,
          front: card.front,
          back: card.back,
          type: card.type || data.generationOptions?.flashcardType || 'definition'
        })) || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading flashcard set:', err);
        setError('Failed to load flashcard set. Please try again later.');
        setLoading(false);
      }
    }

    loadFlashcardSet();
  }, [id, userInfo?.uid]);

  const handleAddCard = () => {
    const newCard: FlashcardItem = {
      front: '',
      back: '',
      type: flashcardData?.generationOptions?.flashcardType || 'definition'
    };
    setFlashcards([...flashcards, newCard]);
  };

  const handleRemoveCard = (index: number) => {
    const newFlashcards = [...flashcards];
    newFlashcards.splice(index, 1);
    setFlashcards(newFlashcards);
  };

  const handleCardChange = (index: number, field: 'front' | 'back', value: string) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index][field] = value;
    setFlashcards(newFlashcards);
  };

  const handleSave = async () => {
    // Validate form
    if (!title.trim()) {
      alert('Please enter a title for the flashcard set');
      return;
    }

    if (flashcards.length === 0) {
      alert('Please add at least one flashcard');
      return;
    }

    // Check for empty cards
    const hasEmptyCards = flashcards.some(card => !card.front.trim() || !card.back.trim());
    if (hasEmptyCards) {
      alert('Please fill in all flashcard fields or remove empty cards');
      return;
    }

    try {
      setSaving(true);
      
      // Prepare update data
      const updateData: Partial<FlashcardSet> = {
        title,
        subject,
        class: className,
        flashcards: flashcards.map(card => ({
          id: card.id || `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          front: card.front,
          back: card.back,
          type: card.type || flashcardData?.generationOptions?.flashcardType || 'definition'
        }))
      };
      
      await updateFlashcardSet(id!, updateData);
      
      // Navigate back to view page
      navigate(`/teacher/content/flashcards/view/${id}`);
    } catch (err) {
      console.error('Error saving flashcard set:', err);
      alert('Failed to save flashcard set. Please try again later.');
      setSaving(false);
    }
  };

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/teacher/content/flashcards')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? 'Loading...' : `Edit: ${flashcardData?.title || 'Flashcard Set'}`}
            </h1>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
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

        {/* Edit form */}
        {!loading && !error && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-8">
              <div className="space-y-8">
                {/* Metadata fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1 md:col-span-3">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="block w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-base"
                      placeholder="Enter a title for your flashcard set"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="block w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-base"
                      placeholder="Enter subject"
                    />
                  </div>
                  <div>
                    <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Class
                    </label>
                    <input
                      type="text"
                      id="class"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="block w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-base"
                      placeholder="Enter class"
                    />
                  </div>
                </div>

                {/* Cards section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Flashcards ({flashcards.length})
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddCard}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Card
                    </button>
                  </div>

                  {/* Card list */}
                  <div className="space-y-6">
                    {flashcards.map((card, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg relative shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(index)}
                          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          aria-label="Remove card"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor={`card-front-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Front
                            </label>
                            <textarea
                              id={`card-front-${index}`}
                              value={card.front}
                              onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                              rows={4}
                              className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-base resize-none"
                              placeholder="Enter the content for the front of the card"
                            />
                          </div>
                          <div>
                            <label htmlFor={`card-back-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Back
                            </label>
                            <textarea
                              id={`card-back-${index}`}
                              value={card.back}
                              onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                              rows={4}
                              className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-base resize-none"
                              placeholder="Enter the content for the back of the card"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {flashcards.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">No cards yet. Click "Add Card" to create your first flashcard.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/teacher/content/flashcards')}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
