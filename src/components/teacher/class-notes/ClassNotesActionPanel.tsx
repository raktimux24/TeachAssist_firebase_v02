import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function ClassNotesActionPanel() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/teacher/content/notes')}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      <Plus className="-ml-1 mr-2 h-5 w-5" />
      Create Notes
    </button>
  );
}
