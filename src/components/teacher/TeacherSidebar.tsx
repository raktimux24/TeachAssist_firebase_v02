import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  PenTool,
  GraduationCap,
  Settings,
  X
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { name: 'Content Generation', href: '/teacher/content', icon: PenTool },
  { name: 'Lesson Plans', href: '/teacher/lessons', icon: BookOpen },
  { name: 'My Resources', href: '/teacher/resources', icon: FileText },
  { name: 'Settings', href: '/teacher/settings', icon: Settings },
];

interface TeacherSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeacherSidebar({ isOpen, onClose }: TeacherSidebarProps) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64 flex flex-col bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
            <GraduationCap className="h-8 w-8" />
            <span className="text-xl font-semibold">TeachAssist</span>
          </Link>
          <button
            type="button"
            className="lg:hidden -mr-2 p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 mt-5 space-y-1 px-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${isActive
                    ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}