import { Eye, Trash2 } from 'lucide-react';

interface ClassNote {
  id: string;
  title: string;
  subject: string;
  class: string;
  book: string;
  type: string;
  layout: string;
  notesCount: number;
  createdAt: string;
  tags: string[];
}

interface ClassNotesTableProps {
  notes: ClassNote[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function ClassNotesTable({ notes, onDelete, onView }: ClassNotesTableProps) {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      {/* Mobile Card View */}
      <div className="block md:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notes.map((note) => (
            <div key={note.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[70%]">{note.title}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => onView(note.id)}
                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1"
                    title="View"
                  >
                    <Eye className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                    <span className="sr-only">View</span>
                  </button>
                  <button
                    onClick={() => onDelete(note.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                    <span className="sr-only">Delete</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <div className="text-gray-500 dark:text-gray-400">Subject:</div>
                <div className="text-gray-900 dark:text-gray-300 font-medium">{note.subject}</div>
                
                <div className="text-gray-500 dark:text-gray-400">Class:</div>
                <div className="text-gray-900 dark:text-gray-300 font-medium">{note.class}</div>
                
                <div className="text-gray-500 dark:text-gray-400">Book:</div>
                <div className="text-gray-900 dark:text-gray-300 font-medium">{note.book || 'No Book'}</div>
                
                <div className="text-gray-500 dark:text-gray-400">Type:</div>
                <div className="text-gray-900 dark:text-gray-300 font-medium">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                  </span>
                </div>
                
                <div className="text-gray-500 dark:text-gray-400">Created:</div>
                <div className="text-gray-900 dark:text-gray-300 font-medium">{note.createdAt}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto -mx-2 sm:-mx-0">
        <div className="w-full">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                Title
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Subject
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Class
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Book
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Type
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Created
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {notes.map((note) => (
              <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                  {note.title}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {note.subject}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {note.class}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {note.book || 'No Book'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {note.createdAt}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onView(note.id)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      title="View"
                    >
                      <Eye className="h-5 w-5" />
                      <span className="sr-only">View</span>
                    </button>
                    <button
                      onClick={() => onDelete(note.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
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
  );
}
