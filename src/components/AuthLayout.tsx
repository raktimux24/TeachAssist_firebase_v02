import React from 'react';
import AuthHeader from './AuthHeader';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AuthHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}