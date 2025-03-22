import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Download } from 'lucide-react';
import { generatePowerPointPresentation } from '../../../../services/presentationGenerator';
import TeacherLayout from '../../../../components/teacher/TeacherLayout';
import PresentationPreview from './components/PresentationPreview';
import { getPresentation, deletePresentation } from '../../../../services/presentationFirebaseService';
import { Presentation } from '../../../../services/presentationService';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface PresentationViewProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function PresentationView({ isDarkMode, onThemeToggle }: PresentationViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  
  const [presentationData, setPresentationData] = useState<Presentation & { 
    firebaseId?: string; 
    userId: string; 
    createdAt: any; 
    updatedAt?: any;
  }>(null as any);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadPresentation() {
      if (!id) {
        setError('No presentation ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getPresentation(id) as unknown as Presentation & { 
          firebaseId?: string; 
          userId: string; 
          createdAt: any; 
          updatedAt?: any;
        };
        
        // Verify that the presentation belongs to the current user
        if (data.userId !== userInfo?.uid) {
          setError('You do not have permission to view this presentation');
          setLoading(false);
          return;
        }
        
        setPresentationData(data);
        
        // Also store in sessionStorage for the PresentationPreview component
        sessionStorage.setItem('generatedPresentation', JSON.stringify(data));
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading presentation:', err);
        setError('Failed to load presentation. Please try again later.');
        setLoading(false);
      }
    }

    loadPresentation();
    
    // Cleanup function
    return () => {
      // Any cleanup needed
    };
  }, [id, userInfo]);

  const handleBack = () => {
    navigate('/teacher/presentations');
  };

  const handleEdit = () => {
    // Navigate to edit page (to be implemented)
    // navigate(`/teacher/content/presentations/edit/${id}`);
    toast.error('Edit functionality not implemented yet');
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deletePresentation(id);
      toast.success('Presentation deleted successfully');
      navigate('/teacher/presentations');
    } catch (err) {
      console.error('Error deleting presentation:', err);
      toast.error('Failed to delete presentation');
    }
  };

  const handleDownload = async () => {
    try {
      if (!presentationData) {
        toast.error('Presentation data not available');
        return;
      }
      
      // Validate presentation data structure
      if (!presentationData.slides || !Array.isArray(presentationData.slides)) {
        console.error('Invalid presentation structure:', presentationData);
        toast.error('Invalid presentation structure');
        return;
      }
      
      // Show loading toast
      const loadingToast = toast.loading('Generating PowerPoint presentation...');
      
      try {
        // Generate and download the PowerPoint file
        await generatePowerPointPresentation(presentationData);
        
        // Dismiss loading toast and show success message
        toast.dismiss(loadingToast);
        toast.success('PowerPoint presentation downloaded successfully');
      } catch (error) {
        // Dismiss loading toast on error
        toast.dismiss(loadingToast);
        throw error; // Re-throw to be caught by outer try-catch
      }
    } catch (error) {
      console.error('Error generating PowerPoint:', error);
      toast.error(`Failed to generate PowerPoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };



  if (loading) {
    return (
      <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </TeacherLayout>
    );
  }

  if (error) {
    return (
      <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Presentations
          </button>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="container mx-auto px-4 py-6">
        {/* Header with back button and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {presentationData?.title || 'Presentation View'}
            </h1>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:flex sm:space-x-2 w-full sm:w-auto">
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center px-2 sm:px-3 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <Edit className="h-4 w-4 mr-1 sm:mr-2" />
              Edit
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center justify-center px-2 sm:px-3 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
              Delete
            </button>
            
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center px-2 sm:px-3 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-1 sm:mr-2" />
              Download
            </button>
            

          </div>
        </div>
        
        {/* Presentation metadata */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{presentationData?.subject || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Class</h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{presentationData?.class || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{presentationData?.type || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Presentation preview */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Presentation Preview</h2>
          <PresentationPreview />
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Delete Presentation</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to delete this presentation? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
