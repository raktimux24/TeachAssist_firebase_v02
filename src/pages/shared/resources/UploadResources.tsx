import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import AdminLayout from '../../../components/admin/AdminLayout';
import UploadForm from './components/UploadForm';
import MetadataForm from './components/MetadataForm';
import { useAuth } from '../../../contexts/AuthContext';
import { uploadFile, createResource } from '../../../firebase/resources';
import toast from 'react-hot-toast';

interface UploadResourcesProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  isAdmin?: boolean;
}

export default function UploadResources({ isDarkMode, onThemeToggle, isAdmin = false }: UploadResourcesProps) {
  const Layout = isAdmin ? AdminLayout : TeacherLayout;
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadProgress(0); // Reset progress when new file is selected
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (metadata: {
    title: string;
    description: string;
    class: string;
    subject: string;
    chapter: string;
    book?: string;
    tags: string[];
  }) => {
    if (!selectedFile || !userInfo) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload file to Firebase Storage
      const filePath = `resources/${userInfo.uid}/${Date.now()}_${selectedFile.name}`;
      const fileUrl = await uploadFile(selectedFile, filePath, (progress) => {
        setUploadProgress(progress);
      });

      // Create resource document in Firestore
      const resourceData = {
        title: metadata.title,
        description: metadata.description,
        fileUrl,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        class: metadata.class,
        subject: metadata.subject,
        chapter: metadata.chapter,
        book: metadata.book,
        tags: metadata.tags || [], // Ensure tags array is always defined
        uploadedBy: userInfo.uid,
        uploadedByName: userInfo.fullName
      };

      await createResource(resourceData);

      // Reset form
      setSelectedFile(null);
      setUploadProgress(0);
      toast.success('Resource uploaded successfully!');
      
      // Navigate to resource library
      navigate(isAdmin ? '/admin/resources' : '/teacher/resources');
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast.error('Failed to upload resource. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload Resources
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isAdmin 
                ? 'Upload and manage resources available to all teachers'
                : 'Upload and manage your teaching resources'
              }
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <UploadForm
              onFileUpload={handleFileSelect}
              onFileRemove={handleFileRemove}
              disabled={isUploading}
              uploadProgress={uploadProgress}
            />
            <MetadataForm
              onSubmit={handleSubmit}
              disabled={!selectedFile || isUploading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}