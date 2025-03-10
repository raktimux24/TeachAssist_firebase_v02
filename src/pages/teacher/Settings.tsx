import React from 'react';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import SettingsTabs from '../../components/teacher/settings/SettingsTabs';

interface SettingsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Settings({ isDarkMode, onThemeToggle }: SettingsProps) {
  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>
        <SettingsTabs isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />
      </div>
    </TeacherLayout>
  );
}