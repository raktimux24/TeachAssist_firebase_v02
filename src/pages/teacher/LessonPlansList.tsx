import React, { useState } from 'react';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import LessonPlansTable from '../../components/teacher/lesson-plans/LessonPlansTable';
import LessonPlansFilters from '../../components/teacher/lesson-plans/LessonPlansFilters';
import LessonPlansActionPanel from '../../components/teacher/lesson-plans/LessonPlansActionPanel';

interface LessonPlansListProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function LessonPlansList({ isDarkMode, onThemeToggle }: LessonPlansListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Lesson Plans
          </h1>
          <LessonPlansActionPanel />
        </div>

        <LessonPlansFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <LessonPlansTable
          searchQuery={searchQuery}
          selectedSubject={selectedSubject}
          selectedClass={selectedClass}
          selectedStatus={selectedStatus}
          sortBy={sortBy}
        />
      </div>
    </TeacherLayout>
  );
}