import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function AuthHeader() {
  return (
    <header className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-primary-600">
            <GraduationCap className="w-8 h-8" />
            <span className="text-xl font-semibold">TeachAssist</span>
          </Link>
          <Link
            to="/"
            className="text-gray-600 hover:text-primary-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </header>
  );
}