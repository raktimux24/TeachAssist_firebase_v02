import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { AVAILABLE_CLASSES, AVAILABLE_SUBJECTS } from '../../../../types/resource';
import toast from 'react-hot-toast';

interface MetadataFormProps {
  onSubmit: (metadata: {
    title: string;
    description: string;
    class: string;
    subject: string;
    chapter: string;
    book?: string;
    tags: string[];
  }) => void;
  disabled?: boolean;
}

export default function MetadataForm({ onSubmit, disabled = false }: MetadataFormProps) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bookName, setBookName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    if (!chapter.trim()) {
      toast.error('Please enter a chapter name');
      return;
    }

    // Submit the form data
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      class: selectedClass,
      subject: selectedSubject,
      chapter: chapter.trim(),
      book: bookName.trim() || undefined,
      tags
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Resource Details
      </h2>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="Enter resource title"
            disabled={disabled}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="Enter resource description"
            disabled={disabled}
          />
        </div>

        {/* Class and Subject Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              disabled={disabled}
              required
            >
              <option value="">Select a class</option>
              {AVAILABLE_CLASSES.map((cls) => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              disabled={disabled}
              required
            >
              <option value="">Select a subject</option>
              {AVAILABLE_SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Chapter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chapter
          </label>
          <input
            type="text"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="Enter chapter name"
            disabled={disabled}
            required
          />
        </div>

        {/* Book Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Book Name (Optional)
          </label>
          <input
            type="text"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="Enter book name"
            disabled={disabled}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-1 hover:text-primary-900 dark:hover:text-primary-100"
                  disabled={disabled}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              className="flex-1 min-w-[120px] bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white p-1"
              placeholder="Add tags..."
              disabled={disabled}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Press Enter to add tags
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            Upload Resource
          </button>
        </div>
      </div>
    </form>
  );
}