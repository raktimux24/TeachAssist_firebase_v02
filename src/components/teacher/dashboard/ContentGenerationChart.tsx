import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardCard } from '../../shared/cards/DashboardCard';
import { useAuth } from '../../../contexts/AuthContext';
import { getDailyContentStats } from '../../../services/dailyContentStatsService';
import { ContentGenerationData, TimeRange } from '../../../types/dailyContentStats';
import toast from 'react-hot-toast';



const CHART_COLORS = {
  'Lesson Plans': '#4F46E5',
  'Question Sets': '#10B981',
  'Presentations': '#F59E0B',
  'Class Notes': '#6366F1',
  'Flash Cards': '#EC4899',
};

export const ContentGenerationChart: React.FC = () => {
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [data, setData] = useState<ContentGenerationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const statsData = await getDailyContentStats(currentUser.uid, timeRange);
        setData(statsData);
      } catch (err) {
        console.error('Error fetching content generation data:', err);
        // Provide more specific error message
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load content generation data: ${errorMessage}`);
        
        // Show a more informative toast message
        toast.error('Content generation chart data could not be loaded. This might be due to missing database indexes or permissions.', {
          duration: 5000,
        });
        
        // Set empty data to avoid rendering issues
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, timeRange]);

  const handleTimeRangeChange = (days: TimeRange) => {
    setTimeRange(days);
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
                onClick={() => handleTimeRangeChange(days as TimeRange)}
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
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="animate-pulse text-gray-400 dark:text-gray-600">Loading chart data...</div>
            </div>
          ) : error ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-red-500 dark:text-red-400">{error}</div>
            </div>
          ) : data.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-gray-500 dark:text-gray-400">No content generation data available for this period.</div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </DashboardCard>
  );
}; 