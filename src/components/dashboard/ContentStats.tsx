import { useEffect, useState } from 'react';
import { BookOpen, Zap, HelpCircle, Presentation, ScrollText } from 'lucide-react';
import OverviewCard from '../shared/dashboard/OverviewCard';
import type { ContentStats } from '../../types/contentStats';
import { getContentStats } from '../../services/contentStatsService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ContentStats() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching content stats for user:', currentUser.uid);
        const userStats = await getContentStats(currentUser.uid);
        console.log('Fetched content stats:', userStats);
        setStats(userStats);
        setError(null);
      } catch (error) {
        console.error('Error fetching content stats:', error);
        setError('Failed to load content statistics');
        toast.error('Failed to load content statistics. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-600 dark:text-yellow-400">No content statistics available.</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Notes Created',
      value: stats.notes,
      icon: ScrollText
    },
    {
      title: 'Flashcard Sets',
      value: stats.flashcards,
      icon: Zap
    },
    {
      title: 'Question Sets',
      value: stats.questionSets,
      icon: HelpCircle
    },
    {
      title: 'Lesson Plans',
      value: stats.lessonPlans,
      icon: BookOpen
    },
    {
      title: 'Presentations',
      value: stats.presentations,
      icon: Presentation
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <OverviewCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
        />
      ))}
    </div>
  );
} 