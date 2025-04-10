import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ContentStats, ContentStatsUpdate } from '../types/contentStats';
import { updateDailyContentStats, initializeDailyStats } from './dailyContentStatsService';
import {
  DEFAULT_STATS,
  getContentStatsFromLocalStorage,
  saveContentStatsToLocalStorage,
  updateLocalContentStats
} from './localContentStatsService';

// Check if an error is a Firebase permission error
const isPermissionError = (error: any): boolean => {
  return (
    error?.code === 'permission-denied' ||
    error?.name === 'FirebaseError' && error?.message?.includes('permission') ||
    error?.message?.includes('Missing or insufficient permissions')
  );
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
      
      // Also save to local storage as backup
      saveContentStatsToLocalStorage(userId, DEFAULT_STATS);
    }
  } catch (error) {
    console.error('Error initializing content stats:', error);
    
    // If it's a permission error, initialize locally
    if (isPermissionError(error)) {
      console.log('Permission error, initializing content stats locally');
      saveContentStatsToLocalStorage(userId, DEFAULT_STATS);
      return; // Don't rethrow, we've handled it
    }
    
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
      
      // Also save to local storage
      saveContentStatsToLocalStorage(userId, DEFAULT_STATS);
      return DEFAULT_STATS;
    }

    // Convert Firestore timestamp to Date
    const stats = {
      ...data.contentStats,
      lastUpdated: data.contentStats.lastUpdated?.toDate() || new Date()
    };

    // Save to local storage for future fallback
    saveContentStatsToLocalStorage(userId, stats);

    console.log('Retrieved content stats:', stats);
    return stats;
  } catch (error) {
    // Check if it's a permission error
    if (isPermissionError(error)) {
      console.warn('Permission error, falling back to local storage for content stats');
      
      // Try to get from local storage
      const localStats = getContentStatsFromLocalStorage(userId);
      
      if (localStats) {
        console.log('Using cached content stats from local storage');
        return localStats;
      } else {
        console.log('No cached content stats found, using defaults');
        const defaultStats = { ...DEFAULT_STATS };
        saveContentStatsToLocalStorage(userId, defaultStats);
        return defaultStats;
      }
    } else {
      // Only log full error for non-permission errors
      console.error('Error getting content stats:', error);
      throw error;
    }
  }
};

/**
 * Update content stats for a user
 */
export const updateContentStats = async (
  userId: string,
  update: ContentStatsUpdate,
  date: Date = new Date()
): Promise<ContentStats> => {
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
      
      // Check if it's a permission error
      if (isPermissionError(dailyStatsError)) {
        console.log('Permission error updating daily stats, updating locally only');
        // No need to retry, we'll update locally instead
      } else {
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
    }

    console.log('Content stats updated successfully in Firestore');
    
    // Get the updated stats to return and cache
    const updatedStats = await getContentStats(userId);
    return updatedStats;
  } catch (error) {
    console.error('Error updating content stats:', error);
    
    // Check if it's a permission error
    if (isPermissionError(error)) {
      console.log('Permission error updating content stats, falling back to local update');
      
      // Update locally and return the updated stats
      const updatedStats = updateLocalContentStats(userId, update);
      console.log('Content stats updated locally:', updatedStats);
      return updatedStats;
    }
    
    throw error;
  }
}; 