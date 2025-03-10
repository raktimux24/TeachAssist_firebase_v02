import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface EngagementData {
  name: string;
  users: number;
  sessions: number;
}

interface EngagementChartProps {
  data: EngagementData[];
}

export default function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 shadow rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 sm:mb-6">
        User Engagement
      </h3>
      <div className="h-60 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="users" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0055FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0055FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#66B2FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#66B2FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              width={40}
            />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#0055FF"
              fillOpacity={1}
              fill="url(#users)"
            />
            <Area
              type="monotone"
              dataKey="sessions"
              stroke="#66B2FF"
              fillOpacity={1}
              fill="url(#sessions)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}