import { useState } from 'react';
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
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Handler for class selection that resets subject and chapter if class changes
  const handleClassChange = (classValue: string) => {
    setSelectedClass(classValue);
    if (classValue !== selectedClass) {
      setSelectedSubject('all');
      setSelectedChapter('all');
    }
  };

  // Handler for subject selection that resets chapter if subject changes
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    if (subject !== selectedSubject) {
      setSelectedChapter('all');
    }
  };

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
              onClassChange={handleClassChange}
              selectedSubject={selectedSubject}
              onSubjectChange={handleSubjectChange}
              selectedChapter={selectedChapter}
              onChapterChange={setSelectedChapter}
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
            selectedChapter={selectedChapter}
            showOnlyUserResources={true}
          />
        ) : (
          <ResourceTable
            searchQuery={searchQuery}
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            selectedChapter={selectedChapter}
            showOnlyUserResources={true}
          />
        )}
      </div>
    </TeacherLayout>
  );
}