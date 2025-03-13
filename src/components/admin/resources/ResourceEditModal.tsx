import { useState, useEffect } from 'react';
import { Resource } from '../../../types/resource';
import { updateResource } from '../../../firebase/resources';
import { X, Save, FileIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { AVAILABLE_CLASSES, AVAILABLE_SUBJECTS } from '../../../types/resource';
import { fetchChapters } from '../../../firebase/resources';

interface ResourceEditModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onResourceUpdated: () => void;
}

export default function ResourceEditModal({
  resource,
  isOpen,
  onClose,
  onResourceUpdated
}: ResourceEditModalProps) {
  const [formData, setFormData] = useState<Partial<Resource>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [chapters, setChapters] = useState<string[]>([]);

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        description: resource.description,
        class: resource.class,
        subject: resource.subject,
        chapter: resource.chapter,
        book: resource.book,
        tags: resource.tags || []
      });

      // Load chapters when class and subject are available
      if (resource.class && resource.subject) {
        loadChapters(resource.class, resource.subject);
      }
    }
  }, [resource]);

  const loadChapters = async (classId: string, subjectId: string) => {
    try {
      setLoading(true);
      const chaptersData = await fetchChapters(classId, subjectId);
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error loading chapters:', error);
      toast.error('Failed to load chapters');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If class or subject changes, reload chapters
    if ((name === 'class' || name === 'subject') && formData.class && formData.subject) {
      loadChapters(
        name === 'class' ? value : formData.class,
        name === 'subject' ? value : formData.subject
      );
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setFormData((prev) => ({ ...prev, tags: tagsArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resource || !resource.id) return;
    
    try {
      setSaving(true);
      await updateResource(resource.id, formData);
      toast.success('Resource updated successfully');
      onResourceUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Resource</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 text-base"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 text-base resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Class
                  </label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 text-base appearance-none"
                    required
                  >
                    <option value="">Select Class</option>
                    {AVAILABLE_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 text-base appearance-none"
                    required
                  >
                    <option value="">Select Subject</option>
                    {AVAILABLE_SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chapter
                  </label>
                  <select
                    id="chapter"
                    name="chapter"
                    value={formData.chapter || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 text-base appearance-none"
                  >
                    <option value="">Select Chapter</option>
                    {loading ? (
                      <option disabled>Loading chapters...</option>
                    ) : (
                      chapters.map((chapter) => (
                        <option key={chapter} value={chapter}>
                          {chapter}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="book" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Book (Optional)
                  </label>
                  <input
                    type="text"
                    id="book"
                    name="book"
                    value={formData.book || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 text-base"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={(formData.tags || []).join(', ')}
                  onChange={handleTagsChange}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 text-base"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex justify-center items-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* File Preview Section */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">File Preview</h3>
            
            <div className="flex items-center mb-5">
              <div className="flex-shrink-0 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <FileIcon className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-900 dark:text-white">{resource.fileName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{resource.fileType}</p>
              </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {resource.fileType.startsWith('image/') ? (
                <img 
                  src={resource.fileUrl} 
                  alt={resource.title} 
                  className="w-full h-full object-contain"
                />
              ) : resource.fileType === 'application/pdf' ? (
                <iframe 
                  src={`${resource.fileUrl}#toolbar=0`} 
                  className="w-full h-full min-h-[350px]"
                  title={resource.title}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[350px] bg-gray-100 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">
                    Preview not available for this file type
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Uploaded by: <span className="font-medium text-gray-800 dark:text-gray-300">{resource.uploadedByName}</span></p>
              <p>Upload date: <span className="font-medium text-gray-800 dark:text-gray-300">{resource.createdAt.toLocaleDateString()}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
