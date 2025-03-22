import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardCard } from '../../shared/cards/DashboardCard';
import { useAuth } from '../../../contexts/AuthContext';
import { getDailyContentStats } from '../../../services/dailyContentStatsService';
import { ContentGenerationData, TimeRange } from '../../../types/dailyContentStats';

// Chart colors for different content types
const CHART_COLORS = {
  'Lesson Plans': '#4F46E5',
  'Question Sets': '#10B981',
  'Presentations': '#F59E0B',
  'Class Notes': '#6366F1',
  'Flash Cards': '#EC4899',
};

/**
 * Content Generation Chart component that displays real data from the database
 */
export const ContentGenerationChart: React.FC = () => {
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [data, setData] = useState<ContentGenerationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState<boolean>(false);


  // Function to fetch data from the database
  const fetchData = async () => {
    if (!currentUser?.uid) {
      setError('No user is currently logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNoData(false);
      
      console.log('Fetching content generation data for user:', currentUser.uid);
      const statsData = await getDailyContentStats(currentUser.uid, timeRange);
      console.log('Received stats data:', statsData);
      
      if (statsData.length === 0) {
        console.log('No data received from getDailyContentStats');
        setNoData(true);
      } else {
        console.log('Setting chart data:', statsData);
        setNoData(false);
      }
      
      setData(statsData);
    } catch (err) {
      console.error('Error fetching content generation data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load content generation data: ${errorMessage}`);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or when timeRange changes
  useEffect(() => {
    fetchData();
  }, [currentUser, timeRange]);

  const handleTimeRangeChange = (days: TimeRange) => {
    console.log('Changing time range to:', days, 'days');
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
              <div className="text-red-500 dark:text-red-400 text-center">
                <p>{error}</p>
                <div className="flex space-x-2 mt-4 justify-center">
                  <button
                    onClick={() => fetchData()}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Retry
                  </button>

                </div>
              </div>
            </div>
          ) : noData || data.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center">
              <div className="text-gray-500 dark:text-gray-400 text-center">
                <p>No content generation data available for this period.</p>
                <p className="mt-2 text-sm">Create some content to see statistics here.</p>
              </div>
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