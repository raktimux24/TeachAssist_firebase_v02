import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { getUserPresentations, FirebasePresentation, deletePresentation } from '../../services/presentationFirebaseService';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutGrid, List, Plus, Search, Filter, SlidersHorizontal, Eye, Trash2 } from 'lucide-react';

interface PresentationsListProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function PresentationsList({ isDarkMode, onThemeToggle }: PresentationsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [presentations, setPresentations] = useState<FirebasePresentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  // Fetch presentations when component mounts or when user changes
  useEffect(() => {
    const fetchPresentations = async () => {
      if (!userInfo?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedPresentations = await getUserPresentations(userInfo.uid);
        setPresentations(fetchedPresentations);
      } catch (err) {
        console.error('Error fetching presentations:', err);
        setError('Failed to load presentations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPresentations();
  }, [userInfo?.uid]);

  // Filter and sort presentations based on user selections
  const filteredAndSortedPresentations = presentations
    .filter(presentation => {
      // Filter by search query (title, subject, class)
      const matchesSearch = searchQuery === '' || 
        (presentation.title && presentation.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (presentation.subject && presentation.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (presentation.class && presentation.class.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by subject
      const matchesSubject = selectedSubject === 'all' || 
        (presentation.subject && presentation.subject.toLowerCase() === selectedSubject.toLowerCase());
      
      // Filter by class
      const matchesClass = selectedClass === 'all' || 
        (presentation.class && presentation.class.toLowerCase() === selectedClass.toLowerCase());
      
      return matchesSearch && matchesSubject && matchesClass;
    })
    .sort((a, b) => {
      // Sort by selected sort option
      if (sortBy === 'date') {
        // Handle cases where createdAt might be undefined or not a valid Date
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'subject') {
        return (a.subject || '').localeCompare(b.subject || '');
      }
      return 0;
    });

  // Convert presentations to the format expected by the components
  const formattedPresentations = filteredAndSortedPresentations.map(presentation => ({
    id: presentation.firebaseId || '',
    title: presentation.title || 'Untitled Presentation',
    subject: presentation.subject || 'No Subject',
    class: presentation.class || 'No Class',
    type: presentation.type || 'standard',
    slideCount: presentation.slides?.length || 0,
    createdAt: presentation.createdAt instanceof Date ? presentation.createdAt.toLocaleDateString() : 'Unknown Date',
  }));

  // Handle delete action
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this presentation? This action cannot be undone.')) {
      try {
        await deletePresentation(id);
        setPresentations(presentations.filter(p => p.firebaseId !== id));
      } catch (err) {
        console.error('Error deleting presentation:', err);
        alert('Failed to delete presentation. Please try again later.');
      }
    }
  };

  // Handle view action
  const handleView = (id: string) => {
    navigate(`/teacher/content/presentations/${id}`);
  };

  // Get unique subjects and classes for filters
  const subjects = ['all', ...new Set(presentations.map(p => p.subject).filter(Boolean))];
  const classes = ['all', ...new Set(presentations.map(p => p.class).filter(Boolean))];

  return (
    <TeacherLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="space-y-4 sm:space-y-6 w-full px-2 sm:px-0">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Presentations
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md ${
                viewMode === 'table'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
              title="Table View"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/teacher/content/presentations')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              New
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search presentations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm text-gray-900 dark:text-white"
              />
            </div>

            {/* Subject Filter */}
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="subject-filter"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm text-gray-900 dark:text-white"
              >
                <option value="all">All Subjects</option>
                {subjects
                  .filter(subject => subject !== 'all')
                  .map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
              </select>
            </div>

            {/* Class Filter */}
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="class-filter"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm text-gray-900 dark:text-white"
              >
                <option value="all">All Classes</option>
                {classes
                  .filter(classItem => classItem !== 'all')
                  .map(classItem => (
                    <option key={classItem} value={classItem}>
                      {classItem}
                    </option>
                  ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SlidersHorizontal className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm text-gray-900 dark:text-white"
              >
                <option value="date">Date (Newest)</option>
                <option value="title">Title (A-Z)</option>
                <option value="subject">Subject (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="min-h-[300px] w-full">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6 sm:p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Loading presentations...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6 sm:p-8 text-center">
              <p className="text-red-500 dark:text-red-400">
                {error}
              </p>
            </div>
          ) : formattedPresentations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6 sm:p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No presentations found. Create your first presentation to get started.
              </p>
              <button
                onClick={() => navigate('/teacher/content/presentations')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Create New Presentation
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
              <div className="overflow-x-auto -mx-2 sm:-mx-0 rounded-lg">
                <div className="w-full min-w-[640px]">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Subject
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Class
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Slides
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {formattedPresentations.map((presentation) => (
                        <tr key={presentation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{presentation.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{presentation.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{presentation.class}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{presentation.slideCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{presentation.createdAt}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleView(presentation.id)}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                title="View"
                              >
                                <Eye className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                                <span className="sr-only">View</span>
                              </button>
                              <button
                                onClick={() => handleDelete(presentation.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <Trash2 className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                                <span className="sr-only">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formattedPresentations.map((presentation) => (
                  <div 
                    key={presentation.id} 
                    className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-5">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate mb-1">
                        {presentation.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {presentation.subject}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {presentation.class}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {presentation.slideCount} slides
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span>Created: {presentation.createdAt}</span>
                      </div>
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => handleView(presentation.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform duration-200 hover:scale-105"
                          title="View"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(presentation.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform duration-200 hover:scale-105"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
