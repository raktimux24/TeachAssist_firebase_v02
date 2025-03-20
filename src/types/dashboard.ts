import { LucideIcon } from 'lucide-react';

export interface TrendData {
  value: number;
  isPositive: boolean;
}

export interface OverviewDataItem {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: TrendData;
}

export interface ContentTypeItem {
  title: string;
  route: string;
  icon: LucideIcon;
  description: string;
}

export interface DashboardLayoutProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  children: React.ReactNode;
} 