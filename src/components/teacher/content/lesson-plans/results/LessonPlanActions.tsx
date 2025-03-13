import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Printer, Copy, Check, Pencil, RefreshCw } from 'lucide-react';
import { LessonPlan } from '../../../../../services/lessonPlanGeneration';
import { toast } from 'react-hot-toast';

export default function LessonPlanActions() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    try {
      const storedLessonPlan = localStorage.getItem('generatedLessonPlan');
      if (storedLessonPlan) {
        setLessonPlan(JSON.parse(storedLessonPlan));
      }
    } catch (err) {
      console.error('Error loading lesson plan:', err);
    }
  }, []);

  const handleEdit = () => {
    navigate('/teacher/content/lesson-plans');
  };

  const handleDownload = async () => {
    if (!lessonPlan) return;
    
    setIsDownloading(true);
    
    try {
      // Create markdown content
      let markdownContent = `# ${lessonPlan.title}\n\n`;
      markdownContent += `Class: ${lessonPlan.class}\n`;
      markdownContent += `Subject: ${lessonPlan.subject}\n`;
      markdownContent += `Chapters: ${lessonPlan.chapters.join(', ')}\n`;
      markdownContent += `Number of Classes: ${lessonPlan.numberOfClasses}\n`;
      markdownContent += `Format: ${lessonPlan.format}\n\n`;
      
      lessonPlan.sections.forEach(section => {
        markdownContent += `## ${section.title}\n\n${section.content}\n\n`;
      });
      
      // Create a blob and download
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lessonPlan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Lesson plan downloaded successfully');
    } catch (err) {
      console.error('Error downloading lesson plan:', err);
      toast.error('Failed to download lesson plan');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToClipboard = () => {
    if (!lessonPlan) return;
    
    try {
      // Create markdown content
      let markdownContent = `# ${lessonPlan.title}\n\n`;
      markdownContent += `Class: ${lessonPlan.class}\n`;
      markdownContent += `Subject: ${lessonPlan.subject}\n`;
      markdownContent += `Chapters: ${lessonPlan.chapters.join(', ')}\n`;
      markdownContent += `Number of Classes: ${lessonPlan.numberOfClasses}\n`;
      markdownContent += `Format: ${lessonPlan.format}\n\n`;
      
      lessonPlan.sections.forEach(section => {
        markdownContent += `## ${section.title}\n\n${section.content}\n\n`;
      });
      
      navigator.clipboard.writeText(markdownContent)
        .then(() => {
          setCopied(true);
          toast.success('Lesson plan copied to clipboard');
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy lesson plan:', err);
          toast.error('Failed to copy lesson plan to clipboard');
        });
    } catch (err) {
      console.error('Error copying lesson plan:', err);
      toast.error('Failed to copy lesson plan');
    }
  };

  const handleRegenerate = () => {
    if (!lessonPlan) return;
    
    // Store the current options in localStorage to pre-fill the form
    localStorage.setItem('lessonPlanOptions', JSON.stringify({
      class: lessonPlan.class,
      subject: lessonPlan.subject,
      chapters: lessonPlan.chapters,
      format: lessonPlan.format,
      numberOfClasses: lessonPlan.numberOfClasses,
      learningObjectives: lessonPlan.learningObjectives || '',
      requiredResources: lessonPlan.requiredResources || ''
    }));
    
    // Navigate back to the lesson plan generator
    navigate('/teacher/content/lesson-plans');
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleCopyToClipboard}
        className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
      <button
        onClick={handleDownload}
        disabled={isDownloading || !lessonPlan}
        className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <div className="animate-spin mr-1 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
            Downloading...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-1" />
            <span>Download</span>
          </>
        )}
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <Printer className="h-4 w-4 mr-1" />
        <span>Print</span>
      </button>
      <button
        onClick={handleEdit}
        className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <Pencil className="h-4 w-4 mr-1" />
        <span>Edit</span>
      </button>
      <button
        onClick={handleRegenerate}
        className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        <span>Regenerate</span>
      </button>
    </div>
  );
}