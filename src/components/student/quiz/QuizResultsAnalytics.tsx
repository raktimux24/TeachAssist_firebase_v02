import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Brain, Clock, Target } from 'lucide-react';

const performanceData = [
  { topic: 'Algebra', score: 85 },
  { topic: 'Geometry', score: 70 },
  { topic: 'Calculus', score: 90 },
];

const recommendations = [
  {
    icon: Brain,
    title: 'Focus Areas',
    description: 'Review Geometry concepts, particularly triangles and circles',
  },
  {
    icon: Clock,
    title: 'Time Management',
    description: 'Spend more time on complex problems, less on basic ones',
  },
  {
    icon: Target,
    title: 'Next Steps',
    description: 'Practice similar questions in the weak areas identified',
  },
];

export default function QuizResultsAnalytics() {
  return (
    <div className="space-y-6">
      {/* Performance by Topic */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Performance by Topic
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="topic" type="category" width={100} />
                <Bar
                  dataKey="score"
                  fill="currentColor"
                  className="text-primary-600 dark:text-primary-400"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Recommendations
          </h3>

          <div className="space-y-4">
            {recommendations.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}