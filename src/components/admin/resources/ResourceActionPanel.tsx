import React from 'react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResourceActionPanel() {
  const navigate = useNavigate();

  return (
    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
      <div>
        <button
          type="button"
          onClick={() => navigate('/admin/resources/upload')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Upload className="-ml-1 mr-2 h-5 w-5" />
          Upload Files
        </button>
      </div>
    </div>
  );
}