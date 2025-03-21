import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { DailyContentStat, ContentGenerationData, TimeRange } from '../types/dailyContentStats';
import { ContentStatsUpdate } from '../types/contentStats';

const DAILY_STATS_COLLECTION = 'dailyContentStats';

/**
 * Get the document ID for a specific date and user
 */
const getDailyStatsDocId = (userId: string, date: Date = new Date()): string => {
  // Format date as YYYY-MM-DD
  const dateString = date.toISOString().split('T')[0];
  
  // Sanitize userId to ensure it's valid for Firestore document IDs
  // Firestore document IDs must not contain: /, ., .., *, [, ], ~, #, %, ?
  const sanitizedUserId = userId.replace(/[\/\.\*\[\]~#%?]/g, '_');
  
  return `${sanitizedUserId}_${dateString}`;
};

/**
 * Initialize daily content stats for a specific date
 */
export const initializeDailyStats = async (
  userId: string, 
  date: Date = new Date()
): Promise<void> => {
  const maxRetries = 3;
  let retryCount = 0;
  let lastError: any = null;
  
  while (retryCount < maxRetries) {
    try {
      if (!userId) {
        console.error('Cannot initialize daily stats: userId is empty or undefined');
        return;
      }
      
      console.log(`Initializing daily content stats for user: ${userId}, date: ${date} (attempt ${retryCount + 1}/${maxRetries})`);
      const docId = getDailyStatsDocId(userId, date);
      console.log('Daily stats document ID:', docId);
      
      const dailyStatsRef = doc(db, DAILY_STATS_COLLECTION, docId);
      console.log('Checking if document exists in collection:', DAILY_STATS_COLLECTION);
      
      const docSnapshot = await getDoc(dailyStatsRef);

      if (!docSnapshot.exists()) {
        console.log('No daily stats found for this date, initializing with zeros');
        const newStatsData = {
          userId,
          date: Timestamp.fromDate(date),
          lessonPlans: 0,
          questionSets: 0,
          presentations: 0,
          notes: 0,
          flashcards: 0
        };
        
        console.log('Attempting to create new document with data:', JSON.stringify(newStatsData));
        await setDoc(dailyStatsRef, newStatsData);
        console.log('Successfully created new daily stats document');
      } else {
        console.log('Daily stats document already exists for this date');
      }
      
      // If we reach here, operation was successful
      return;
      
    } catch (error) {
      lastError = error;
      console.error(`Error initializing daily content stats (attempt ${retryCount + 1}/${maxRetries}):`, error);
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check if it's a network-related error
        const isNetworkError = 
          error.message.includes('network') || 
          error.message.includes('offline') || 
          error.message.includes('connection') ||
          error.message.includes('unavailable');
          
        if (isNetworkError && retryCount < maxRetries - 1) {
          retryCount++;
          const delayMs = 1000 * Math.pow(2, retryCount); // Exponential backoff
          console.log(`Network error detected, retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
      }
      
      if (retryCount < maxRetries - 1) {
        retryCount++;
        const delayMs = 1000 * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.error(`Failed to initialize daily stats after ${maxRetries} attempts`);
        throw error;
      }
    }
  }
  
  // If we've exhausted all retries
  throw lastError || new Error('Failed to initialize daily stats after multiple attempts');
};

/**
 * Update daily content stats for a specific date
 */
export const updateDailyContentStats = async (
  userId: string,
  update: ContentStatsUpdate,
  date: Date = new Date()
): Promise<void> => {
  const maxRetries = 3;
  let retryCount = 0;
  let lastError: any = null;
  
  while (retryCount < maxRetries) {
    try {
      if (!userId) {
        console.error('Cannot update daily stats: userId is empty or undefined');
        return;
      }
      
      if (!update || !update.type) {
        console.error('Cannot update daily stats: invalid update object', update);
        return;
      }
      
      console.log(`Updating daily content stats for user: ${userId}, with update: ${JSON.stringify(update)}, date: ${date} (attempt ${retryCount + 1}/${maxRetries})`);
      const docId = getDailyStatsDocId(userId, date);
      console.log('Daily stats document ID:', docId);
      
      const dailyStatsRef = doc(db, DAILY_STATS_COLLECTION, docId);
      console.log('Checking if document exists in collection:', DAILY_STATS_COLLECTION);
      
      let docExists = false;
      try {
        const docSnapshot = await getDoc(dailyStatsRef);
        docExists = docSnapshot.exists();
      } catch (readError) {
        console.warn('Error checking if document exists:', readError);
        // Continue with assumption that document needs to be initialized
      }

      // If document doesn't exist, create it first
      if (!docExists) {
        console.log('Document does not exist or could not be read, initializing first');
        try {
          await initializeDailyStats(userId, date);
        } catch (initError) {
          console.error('Error during initialization, will retry the whole operation:', initError);
          throw initError; // This will trigger a retry of the whole operation
        }
        
        // Verify the document was created
        try {
          const verifySnapshot = await getDoc(dailyStatsRef);
          if (!verifySnapshot.exists()) {
            console.error('Failed to initialize document before update');
            throw new Error('Document initialization failed');
          }
        } catch (verifyError) {
          console.warn('Error verifying document creation:', verifyError);
          // Continue anyway and attempt the update
        }
      }

      // Map the content type to the field name in the document
      const fieldMap: Record<string, string> = {
        'notes': 'notes',
        'flashcards': 'flashcards',
        'questionSets': 'questionSets',
        'lessonPlans': 'lessonPlans',
        'presentations': 'presentations'
      };

      const fieldName = fieldMap[update.type];
      if (!fieldName) {
        console.error('Unknown content type:', update.type);
        throw new Error(`Unknown content type: ${update.type}`);
      }
      
      const incrementValue = update.operation === 'increment' ? 1 : -1;
      console.log(`Updating field '${fieldName}' with increment value: ${incrementValue}`);
      
      // Update the specific field
      await updateDoc(dailyStatsRef, {
        [fieldName]: increment(incrementValue)
      });

      console.log('Daily content stats updated successfully');
      return; // Success, exit the function
      
    } catch (error) {
      lastError = error;
      console.error(`Error updating daily content stats (attempt ${retryCount + 1}/${maxRetries}):`, error);
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check if it's a network-related error
        const isNetworkError = 
          error.message.includes('network') || 
          error.message.includes('offline') || 
          error.message.includes('connection') ||
          error.message.includes('unavailable');
          
        if (isNetworkError) {
          console.warn('Network error detected, will retry');
        }
      }
      
      if (retryCount < maxRetries - 1) {
        retryCount++;
        const delayMs = 1000 * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying update in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.error(`Failed to update daily stats after ${maxRetries} attempts`);
        throw error;
      }
    }
  }
  
  // If we've exhausted all retries
  throw lastError || new Error('Failed to update daily stats after multiple attempts');
};

/**
 * Get daily content stats for a specific time range
 */
export const getDailyContentStats = async (
  userId: string,
  days: TimeRange
): Promise<ContentGenerationData[]> => {
  try {
    console.log('Getting daily content stats for user:', userId, 'days:', days);
    
    if (!userId) {
      console.error('No userId provided to getDailyContentStats');
      return generateEmptyDataSet(days);
    }
    
    // Calculate the start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    // Use a simpler query that doesn't require a composite index
    // Just query by userId and filter the results in memory
    const statsQuery = query(
      collection(db, DAILY_STATS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(statsQuery);
    
    // Process the results and filter by date in memory
    const dailyStats: DailyContentStat[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Skip documents without a date field
      if (!data.date) return;
      
      const docDate = data.date.toDate();
      // Filter by date in memory
      if (docDate >= startDate) {
        dailyStats.push({
          userId: data.userId,
          date: docDate,
          lessonPlans: data.lessonPlans || 0,
          questionSets: data.questionSets || 0,
          presentations: data.presentations || 0,
          notes: data.notes || 0,
          flashcards: data.flashcards || 0
        });
      }
    });
    
    // Sort by date in ascending order
    dailyStats.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Determine the interval based on the days
    const interval = days <= 30 ? 5 : days <= 60 ? 10 : 15; // 5-day intervals for 30 days, 10 for 60, 15 for 90
    
    // Group the data by intervals
    const groupedData: ContentGenerationData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create date buckets based on the interval
    for (let i = days; i >= 0; i -= interval) {
      const bucketDate = new Date(today);
      bucketDate.setDate(bucketDate.getDate() - i);
      
      const endDate = new Date(bucketDate);
      endDate.setDate(endDate.getDate() + interval - 1);
      
      // Find stats within this date range
      const statsInRange = dailyStats.filter(stat => {
        const statDate = new Date(stat.date);
        return statDate >= bucketDate && statDate <= endDate;
      });
      
      // Sum up the stats for this interval
      const summedStats: ContentGenerationData = {
        name: `${bucketDate.getDate()} ${bucketDate.toLocaleString('default', { month: 'short' })}`,
        'Lesson Plans': statsInRange.reduce((sum, stat) => sum + stat.lessonPlans, 0),
        'Question Sets': statsInRange.reduce((sum, stat) => sum + stat.questionSets, 0),
        'Presentations': statsInRange.reduce((sum, stat) => sum + stat.presentations, 0),
        'Class Notes': statsInRange.reduce((sum, stat) => sum + stat.notes, 0),
        'Flash Cards': statsInRange.reduce((sum, stat) => sum + stat.flashcards, 0)
      };
      
      groupedData.push(summedStats);
    }
    
    console.log('Retrieved and processed daily content stats:', groupedData);
    return groupedData;
  } catch (error) {
    console.error('Error getting daily content stats:', error);
    // Return empty data set instead of throwing error
    return generateEmptyDataSet(days);
  }
};

/**
 * Generate an empty data set for the chart when there's an error
 * This prevents the UI from breaking when data can't be fetched
 */
const generateEmptyDataSet = (days: TimeRange): ContentGenerationData[] => {
  const result: ContentGenerationData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Determine the interval based on the days
  const interval = days <= 30 ? 5 : days <= 60 ? 10 : 15;
  
  // Create empty data points
  for (let i = days; i >= 0; i -= interval) {
    const bucketDate = new Date(today);
    bucketDate.setDate(bucketDate.getDate() - i);
    
    result.push({
      name: `${bucketDate.getDate()} ${bucketDate.toLocaleString('default', { month: 'short' })}`,
      'Lesson Plans': 0,
      'Question Sets': 0,
      'Presentations': 0,
      'Class Notes': 0,
      'Flash Cards': 0
    });
  }
  
  return result;
};

/**
 * Utility function to check if the daily content stats collection exists and has documents
 */
export const checkDailyStatsCollection = async (): Promise<void> => {
  try {
    console.log('Checking daily content stats collection...');
    
    // Get a reference to the collection
    const statsCollection = collection(db, DAILY_STATS_COLLECTION);
    
    // Get all documents in the collection (limited to 10)
    const q = query(statsCollection, limit(10));
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.size} documents in the collection`);
    
    // Log the first few documents
    querySnapshot.forEach((doc) => {
      console.log('Document ID:', doc.id);
      console.log('Document data:', doc.data());
    });
    
    console.log('Collection check completed');
  } catch (error) {
    console.error('Error checking daily stats collection:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
};

/**
 * Test function to manually test daily content stats functionality
 * This can be called from the browser console to diagnose issues
 */
export const testDailyContentStats = async (userId: string): Promise<void> => {
  try {
    console.log('=== TESTING DAILY CONTENT STATS ===');
    console.log('Testing with userId:', userId);
    
    // Step 1: Initialize stats for today
    const today = new Date();
    console.log('Step 1: Initializing stats for today:', today.toISOString());
    await initializeDailyStats(userId, today);
    
    // Step 2: Update stats for notes
    console.log('Step 2: Updating stats for notes');
    await updateDailyContentStats(userId, {
      type: 'notes',
      operation: 'increment'
    }, today);
    
    // Step 3: Get daily stats
    console.log('Step 3: Getting daily stats');
    const stats = await getDailyContentStats(userId, 30);
    console.log('Retrieved stats:', stats);
    
    console.log('=== TEST COMPLETED SUCCESSFULLY ===');
    return;
  } catch (error) {
    console.error('=== TEST FAILED ===');
    console.error('Error testing daily content stats:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};
