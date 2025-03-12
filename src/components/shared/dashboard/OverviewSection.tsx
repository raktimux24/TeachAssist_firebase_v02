import { DivideIcon } from 'lucide-react';
import OverviewCard from './OverviewCard';

interface OverviewItem {
  title: string;
  value: string | number;
  icon: typeof DivideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface OverviewSectionProps {
  data: OverviewItem[];
}

export default function OverviewSection({ data }: OverviewSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item) => (
        <OverviewCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          trend={item.trend}
        />
      ))}
    </div>
  );
}