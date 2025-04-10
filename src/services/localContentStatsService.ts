import { ContentStats, ContentStatsUpdate } from '../types/contentStats';
import { ContentGenerationData, TimeRange } from '../types/dailyContentStats';

const CONTENT_STATS_KEY = 'teachassist_content_stats';
const DAILY_CONTENT_STATS_KEY = 'teachassist_daily_content_stats';

// Default content stats
export const DEFAULT_STATS: ContentStats = {
  notes: 0,
  flashcards: 0,
  questionSets: 0,
  lessonPlans: 0,
  presentations: 0,
  lastUpdated: new Date()
};

/**
 * Save content stats to local storage
 */
export const saveContentStatsToLocalStorage = (userId: string, stats: ContentStats): void => {
  try {
    const key = `${CONTENT_STATS_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify({
      ...stats,
      lastUpdated: stats.lastUpdated.toISOString()
    }));
  } catch (error) {
    console.warn('Error saving content stats to local storage:', error);
  }
};

/**
 * Get content stats from local storage
 */
export const getContentStatsFromLocalStorage = (userId: string): ContentStats | null => {
  try {
    const key = `${CONTENT_STATS_KEY}_${userId}`;
    const statsJson = localStorage.getItem(key);
    
    if (!statsJson) {
      return null;
    }
    
    const stats = JSON.parse(statsJson);
    return {
      ...stats,
      lastUpdated: new Date(stats.lastUpdated)
    };
  } catch (error) {
    console.warn('Error getting content stats from local storage:', error);
    return null;
  }
};

/**
 * Update content stats in local storage
 */
export const updateLocalContentStats = (
  userId: string,
  update: ContentStatsUpdate
): ContentStats => {
  const currentStats = getContentStatsFromLocalStorage(userId) || { ...DEFAULT_STATS };
  
  const updatedStats = {
    ...currentStats,
    [update.type]: update.operation === 'increment' 
      ? (currentStats[update.type] || 0) + 1 
      : Math.max(0, (currentStats[update.type] || 0) - 1),
    lastUpdated: new Date()
  };
  
  saveContentStatsToLocalStorage(userId, updatedStats);
  
  // Also update daily stats
  updateLocalDailyContentStats(userId, update);
  
  return updatedStats;
};

/**
 * Save daily content stats to local storage
 */
export const saveDailyContentStatsToLocalStorage = (
  userId: string, 
  stats: ContentGenerationData[]
): void => {
  try {
    const key = `${DAILY_CONTENT_STATS_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(stats));
  } catch (error) {
    console.warn('Error saving daily content stats to local storage:', error);
  }
};

/**
 * Get daily content stats from local storage
 */
export const getDailyContentStatsFromLocalStorage = (
  userId: string
): ContentGenerationData[] | null => {
  try {
    const key = `${DAILY_CONTENT_STATS_KEY}_${userId}`;
    const statsJson = localStorage.getItem(key);
    
    if (!statsJson) {
      return null;
    }
    
    return JSON.parse(statsJson).map((item: any) => ({
      ...item,
      date: new Date(item.date)
    }));
  } catch (error) {
    console.warn('Error getting daily content stats from local storage:', error);
    return null;
  }
};

/**
 * Update daily content stats in local storage
 */
export const updateLocalDailyContentStats = (
  userId: string,
  update: ContentStatsUpdate,
  date: Date = new Date()
): void => {
  try {
    // Get current daily stats or initialize with empty array
    const dailyStats = getDailyContentStatsFromLocalStorage(userId) || [];
    
    // Format date as YYYY-MM-DD for comparison
    const dateString = date.toISOString().split('T')[0];
    
    // Find the entry for today
    const todayIndex = dailyStats.findIndex(
      item => item.date.toISOString().split('T')[0] === dateString
    );
    
    if (todayIndex >= 0) {
      // Update existing entry
      const updatedStats = [...dailyStats];
      updatedStats[todayIndex] = {
        ...updatedStats[todayIndex],
        [update.type]: update.operation === 'increment'
          ? (updatedStats[todayIndex][update.type] || 0) + 1
          : Math.max(0, (updatedStats[todayIndex][update.type] || 0) - 1)
      };
      saveDailyContentStatsToLocalStorage(userId, updatedStats);
    } else {
      // Create new entry for today
      const newEntry: ContentGenerationData = {
        date,
        notes: 0,
        flashcards: 0,
        questionSets: 0,
        lessonPlans: 0,
        presentations: 0
      };
      
      // Update the specific content type
      newEntry[update.type] = 1;
      
      // Add to the array and save
      saveDailyContentStatsToLocalStorage(userId, [...dailyStats, newEntry]);
    }
  } catch (error) {
    console.warn('Error updating local daily content stats:', error);
  }
};

/**
 * Generate empty data set for the chart
 */
export const generateEmptyDataSet = (days: TimeRange): ContentGenerationData[] => {
  const result: ContentGenerationData[] = [];
  const today = new Date();
  
  // Generate empty data for the specified number of days
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    result.unshift({
      date,
      notes: 0,
      flashcards: 0,
      questionSets: 0,
      lessonPlans: 0,
      presentations: 0
    });
  }
  
  return result;
};

/**
 * Get local daily content stats for a specific time range
 */
export const getLocalDailyContentStats = (
  userId: string,
  days: TimeRange
): ContentGenerationData[] => {
  try {
    const allStats = getDailyContentStatsFromLocalStorage(userId);
    
    if (!allStats || allStats.length === 0) {
      return generateEmptyDataSet(days);
    }
    
    // Calculate the start date (days ago from today)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);
    
    // Filter stats to only include dates within the range
    const filteredStats = allStats.filter(
      item => item.date >= startDate && item.date <= today
    );
    
    // If we don't have enough data, fill in the gaps
    if (filteredStats.length < days) {
      const emptyDataSet = generateEmptyDataSet(days);
      
      // Merge the empty dataset with our filtered stats
      for (const stat of filteredStats) {
        const dateString = stat.date.toISOString().split('T')[0];
        const index = emptyDataSet.findIndex(
          item => item.date.toISOString().split('T')[0] === dateString
        );
        
        if (index >= 0) {
          emptyDataSet[index] = stat;
        }
      }
      
      return emptyDataSet;
    }
    
    return filteredStats;
  } catch (error) {
    console.warn('Error getting local daily content stats:', error);
    return generateEmptyDataSet(days);
  }
};
