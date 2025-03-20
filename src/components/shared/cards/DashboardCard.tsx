import React from 'react';
import clsx from 'clsx';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ 
  children, 
  className,
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "bg-white dark:bg-gray-800 shadow rounded-lg p-6",
        onClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}; 