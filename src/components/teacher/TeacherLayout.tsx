import React, { useState } from 'react';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';

interface TeacherLayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function TeacherLayout({ children, isDarkMode, onThemeToggle }: TeacherLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden max-w-[100vw]">
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen w-full max-w-[100vw] overflow-hidden">
        <TeacherHeader 
          onMenuClick={() => setIsSidebarOpen(true)}
          isDarkMode={isDarkMode}
          onThemeToggle={onThemeToggle}
        />
        <main className="flex-1 py-2 sm:py-4 md:py-6 w-full overflow-hidden">
          <div className="mx-auto w-full max-w-full sm:max-w-7xl px-1 sm:px-4 lg:px-6 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}