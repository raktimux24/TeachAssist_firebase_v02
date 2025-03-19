import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function QuestionSetsActionPanel() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/teacher/content/question-sets')}
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      <Plus className="-ml-0.5 mr-2 h-4 w-4" />
      New Question Set
    </button>
  );
}
