import { UserPlus, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ActionPanel() {
  const navigate = useNavigate();

  return (
    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => navigate('/admin/users/add')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <UserPlus className="-ml-1 mr-2 h-5 w-5" />
          Add User
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/users/bulk-upload')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Upload className="-ml-1 mr-2 h-5 w-5" />
          Bulk Upload
        </button>
      </div>
    </div>
  );
}