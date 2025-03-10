import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import SettingsTabs from '../../components/admin/settings/SettingsTabs';

interface SettingsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Settings({ isDarkMode, onThemeToggle }: SettingsProps) {
  return (
    <AdminLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>
        <SettingsTabs isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />
      </div>
    </AdminLayout>
  );
}