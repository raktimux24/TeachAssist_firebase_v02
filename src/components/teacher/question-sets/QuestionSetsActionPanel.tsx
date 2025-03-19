
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function QuestionSetsActionPanel() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/teacher/content/question-sets')}
      className="inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      <Plus className="-ml-0.5 mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
      New Question Set
    </button>
  );
}
