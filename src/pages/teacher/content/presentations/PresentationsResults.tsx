import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import PresentationPreview from '../presentations/components/PresentationPreview';
import PresentationActions from '../presentations/components/PresentationActions';
import { getPresentation } from '../../../../services/presentationFirebaseService';
import { Presentation } from '../../../../services/presentationService';

interface PresentationsResultsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function PresentationsResults({ isDarkMode, onThemeToggle }: PresentationsResultsProps) {
  const { presentationId } = useParams<{ presentationId: string }>();
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPresentation = async () => {
      // If no presentationId, check session storage (for newly generated presentations)
      if (!presentationId) {
        console.log('No presentationId in URL, checking sessionStorage');
        const savedPresentation = sessionStorage.getItem('generatedPresentation');
        if (savedPresentation) {
          try {
            const parsedPresentation = JSON.parse(savedPresentation) as Presentation;
            setPresentation(parsedPresentation);
            return;
          } catch (err) {
            console.error('Error parsing presentation from sessionStorage:', err);
            setError('Error loading the generated presentation from session storage.');
          }
        }
        return;
      }

      // If we have a presentationId, fetch from Firestore
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching presentation with ID:', presentationId);
        const fetchedPresentation = await getPresentation(presentationId);
        
        if (fetchedPresentation) {
          console.log('Successfully fetched presentation:', fetchedPresentation);
          setPresentation(fetchedPresentation);
          
          // Also store in sessionStorage for the PresentationPreview component
          sessionStorage.setItem('generatedPresentation', JSON.stringify(fetchedPresentation));
        } else {
          setError('Presentation not found. It may have been deleted or you may not have permission to view it.');
        }
      } catch (err) {
        console.error('Error fetching presentation:', err);
        setError('Failed to load the presentation. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPresentation();
  }, [presentationId]);

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {loading ? 'Loading Presentation...' : presentation?.title || 'Generated Presentation'}
          </h1>
          <PresentationActions />
        </div>
        
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <PresentationPreview />
        )}
      </div>
    </TeacherLayout>
  );
}