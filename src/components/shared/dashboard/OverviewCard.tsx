import { DivideIcon } from 'lucide-react';

interface OverviewCardProps {
  title: string;
  value: string | number;
  icon: typeof DivideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function OverviewCard({ title, value, icon: Icon, trend }: OverviewCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow p-4 sm:p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate mb-1">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                {value}
              </div>
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}%
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}