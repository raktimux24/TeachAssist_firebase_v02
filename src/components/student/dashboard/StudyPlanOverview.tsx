import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

interface StudyTask {
  id: number;
  subject: string;
  topic: string;
  duration: string;
  completed: boolean;
}

const studyTasks: StudyTask[] = [
  {
    id: 1,
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    duration: '45 mins',
    completed: false
  },
  {
    id: 2,
    subject: 'Physics',
    topic: 'Newton\'s Laws of Motion',
    duration: '30 mins',
    completed: true
  },
  {
    id: 3,
    subject: 'Chemistry',
    topic: 'Periodic Table',
    duration: '40 mins',
    completed: false
  }
];

export default function StudyPlanOverview() {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Today's Study Plan
        </h3>
        <button 
          onClick={() => navigate('/student/study-plan')}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
        >
          View Full Plan
        </button>
      </div>
      <div className="space-y-4">
        {studyTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                {task.subject} - {task.topic}
              </h4>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                {task.duration}
              </div>
            </div>
            <CheckCircle 
              className={`w-6 h-6 ${
                task.completed 
                  ? 'text-green-500' 
                  : 'text-gray-300 dark:text-gray-600'
              }`} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}