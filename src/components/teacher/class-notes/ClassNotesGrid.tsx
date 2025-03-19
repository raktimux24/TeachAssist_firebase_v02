import { FileText, Eye, Trash2, Tag } from 'lucide-react';

interface ClassNote {
  id: string;
  title: string;
  subject: string;
  class: string;
  type: string;
  layout: string;
  notesCount: number;
  createdAt: string;
  tags: string[];
}

interface ClassNotesGridProps {
  notes: ClassNote[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function ClassNotesGrid({ notes, onDelete, onView }: ClassNotesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                    {note.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {note.subject} • {note.class}
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
              </span>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="mr-2">Layout:</span>
                <span className="font-medium">
                  {note.layout === 'one-column' ? 'One Column' : 'Two Column'}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="mr-2">Notes:</span>
                <span className="font-medium">{note.notesCount}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="mr-2">Created:</span>
                <span>{note.createdAt}</span>
              </div>
            </div>
            
            {note.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Topics:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {note.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      +{note.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <button
                onClick={() => onView(note.id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-400 dark:bg-primary-900 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
