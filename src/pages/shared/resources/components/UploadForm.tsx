import React, { useState } from 'react';
import { Upload, X, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadFile } from '../../../../firebase/resources';

interface UploadFormProps {
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
  disabled?: boolean;
  uploadProgress?: number;
}

export default function UploadForm({ 
  onFileUpload, 
  onFileRemove, 
  disabled = false,
  uploadProgress = 0
}: UploadFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileSelection(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type);
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

    if (!isValidType) {
      toast.error('Invalid file type. Please upload PDF, DOC, DOCX, PPT, or PPTX files.');
      return;
    }

    if (!isValidSize) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    onFileUpload(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileRemove();
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Upload File
      </h2>

      {!selectedFile ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-4 sm:p-8 text-center
            transition-colors duration-200
            ${dragActive 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-300 dark:border-gray-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragEnter={disabled ? undefined : handleDrag}
          onDragLeave={disabled ? undefined : handleDrag}
          onDragOver={disabled ? undefined : handleDrag}
          onDrop={disabled ? undefined : handleDrop}
        >
          <input
            type="file"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={disabled}
            accept=".pdf,.doc,.docx,.ppt,.pptx"
          />
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-primary-600 dark:text-primary-400">
                Click to upload
              </span>{' '}
              or drag and drop
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PDF, DOC, DOCX, PPT, PPTX up to 10MB
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <File className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {selectedFile.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {uploadProgress > 0 && (
              <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            <button
              onClick={removeFile}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
            >
              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}