import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ContentStats, ContentStatsUpdate } from '../types/contentStats';
import { updateDailyContentStats, initializeDailyStats } from './dailyContentStatsService';

const DEFAULT_STATS: ContentStats = {
  notes: 0,
  flashcards: 0,
  questionSets: 0,
  lessonPlans: 0,
  presentations: 0,
  lastUpdated: new Date()
};

/**
 * Initialize content stats for a new user
 */
export const initializeContentStats = async (userId: string): Promise<void> => {
  try {
    console.log('Initializing content stats for user:', userId);
    const userStatsRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userStatsRef);

    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data();
    if (!userData.contentStats) {
      console.log('No content stats found, initializing with defaults');
      await updateDoc(userStatsRef, {
        contentStats: {
          ...DEFAULT_STATS,
          lastUpdated: serverTimestamp()
        }
      });
    }
  } catch (error) {
    console.error('Error initializing content stats:', error);
    throw error;
  }
};

/**
 * Get content stats for a user
 */
export const getContentStats = async (userId: string): Promise<ContentStats> => {
  try {
    console.log('Getting content stats for user:', userId);
    const userStatsRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userStatsRef);

    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const data = userDoc.data();
    if (!data.contentStats) {
      console.log('No content stats found, initializing with defaults');
      await updateDoc(userStatsRef, {
        contentStats: {
          ...DEFAULT_STATS,
          lastUpdated: serverTimestamp()
        }
      });
      return DEFAULT_STATS;
    }

    // Convert Firestore timestamp to Date
    const stats = {
      ...data.contentStats,
      lastUpdated: data.contentStats.lastUpdated?.toDate() || new Date()
    };

    console.log('Retrieved content stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error getting content stats:', error);
    throw error;
  }
};

/**
 * Update content stats for a user
 */
export const updateContentStats = async (
  userId: string,
  update: ContentStatsUpdate,
  date: Date = new Date()
): Promise<void> => {
  try {
    console.log('Updating content stats for user:', userId, 'with update:', update);
    const userStatsRef = doc(db, 'users', userId);
    
    // Update overall stats
    await updateDoc(userStatsRef, {
      [`contentStats.${update.type}`]: increment(update.operation === 'increment' ? 1 : -1),
      'contentStats.lastUpdated': serverTimestamp()
    });

    // Also update daily stats
    try {
      console.log('Attempting to update daily content stats for date:', date.toISOString());
      await updateDailyContentStats(userId, update, date);
      console.log('Successfully updated daily content stats');
    } catch (dailyStatsError) {
      console.error('Error updating daily content stats:', dailyStatsError);
      
      // Log more details about the error
      if (dailyStatsError instanceof Error) {
        console.error('Error name:', dailyStatsError.name);
        console.error('Error message:', dailyStatsError.message);
        console.error('Error stack:', dailyStatsError.stack);
      }
      
      // Try to initialize the daily stats collection in case it doesn't exist
      try {
        console.log('Attempting to initialize daily stats as fallback...');
        const initializeResult = await initializeDailyStats(userId, date);
        console.log('Initialization result:', initializeResult);
        
        // Try updating again after initialization
        console.log('Retrying daily stats update after initialization...');
        await updateDailyContentStats(userId, update, date);
        console.log('Successfully updated daily content stats on retry');
      } catch (retryError) {
        console.error('Failed to initialize and retry daily stats update:', retryError);
        // Continue even if daily stats update fails
      }
    }

    console.log('Content stats updated successfully');
  } catch (error) {
    console.error('Error updating content stats:', error);
    throw error;
  }
}; 