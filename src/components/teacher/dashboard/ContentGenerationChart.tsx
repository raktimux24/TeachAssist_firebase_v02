import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardCard } from '../../shared/cards/DashboardCard';

interface ContentData {
  name: string;
  'Lesson Plans': number;
  'Question Sets': number;
  'Presentations': number;
  'Class Notes': number;
  'Flash Cards': number;
}

const generateDummyData = (days: number): ContentData[] => {
  // Get current date
  const currentDate = new Date();
  const data: ContentData[] = [];
  
  // Determine the interval based on the days
  const interval = days <= 30 ? 5 : days <= 60 ? 10 : 15; // 5-day intervals for 30 days, 10 for 60, 15 for 90
  
  // Generate data points from past to present
  for (let i = days; i > 0; i -= interval) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    data.push({
      name: `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`,
      'Lesson Plans': Math.floor(Math.random() * 10) + 5,
      'Question Sets': Math.floor(Math.random() * 15) + 8,
      'Presentations': Math.floor(Math.random() * 8) + 3,
      'Class Notes': Math.floor(Math.random() * 12) + 6,
      'Flash Cards': Math.floor(Math.random() * 10) + 4,
    });
  }
  
  // Add current date
  data.push({
    name: `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })}`,
    'Lesson Plans': Math.floor(Math.random() * 10) + 5,
    'Question Sets': Math.floor(Math.random() * 15) + 8,
    'Presentations': Math.floor(Math.random() * 8) + 3,
    'Class Notes': Math.floor(Math.random() * 12) + 6,
    'Flash Cards': Math.floor(Math.random() * 10) + 4,
  });

  return data;
};

const CHART_COLORS = {
  'Lesson Plans': '#4F46E5',
  'Question Sets': '#10B981',
  'Presentations': '#F59E0B',
  'Class Notes': '#6366F1',
  'Flash Cards': '#EC4899',
};

export const ContentGenerationChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<30 | 60 | 90>(30);
  const [data, setData] = useState<ContentData[]>(() => generateDummyData(30));

  const handleTimeRangeChange = (days: 30 | 60 | 90) => {
    setTimeRange(days);
    setData(generateDummyData(days));
  };

  return (
    <DashboardCard>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Content Generation Overview
          </h3>
          <div className="flex space-x-2">
            {[30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => handleTimeRangeChange(days as 30 | 60 | 90)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === days
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.375rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingBottom: '10px' }}
              />
              {Object.keys(CHART_COLORS).map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={CHART_COLORS[key as keyof typeof CHART_COLORS]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardCard>
  );
}; 