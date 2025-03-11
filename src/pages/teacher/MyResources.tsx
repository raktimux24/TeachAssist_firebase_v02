import React, { useState } from 'react';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import ResourcesFilters from '../../components/teacher/resources/ResourcesFilters';
import ResourcesViewToggle from '../../components/teacher/resources/ResourcesViewToggle';
import ResourcesActionPanel from '../../components/teacher/resources/ResourcesActionPanel';
import ResourceGrid from '../../components/admin/resources/ResourceGrid';
import ResourceTable from '../../components/admin/resources/ResourceTable';

interface MyResourcesProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function MyResources({ isDarkMode, onThemeToggle }: MyResourcesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            My Resources
          </h1>
          <ResourcesActionPanel />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1">
            <ResourcesFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          </div>
          <ResourcesViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {viewMode === 'grid' ? (
          <ResourceGrid
            searchQuery={searchQuery}
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            selectedType={selectedType}
            showOnlyUserResources={true}
          />
        ) : (
          <ResourceTable
            searchQuery={searchQuery}
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            selectedType={selectedType}
            showOnlyUserResources={true}
          />
        )}
      </div>
    </TeacherLayout>
  );
}