import React from 'react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResourcesActionPanel() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/teacher/resources/upload')}
      className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      <Upload className="-ml-0.5 sm:-ml-1 mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
      Upload Files
    </button>
  );
}