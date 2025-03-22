import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  query, 
  getDocs, 
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ContentGenerationData, TimeRange } from '../types/dailyContentStats';
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
 * Fetches actual data from Firebase based on the user's content generation activity
 */
export const getDailyContentStats = async (
  userId: string,
  days: TimeRange
): Promise<ContentGenerationData[]> => {
  try {
    console.log('Getting daily content stats for user:', userId, 'days:', days);
    
    if (!userId) {
      console.error('Cannot get daily stats: userId is empty or undefined');
      throw new Error('User ID is required');
    }
    
    // Calculate the start date based on the requested time range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of today
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0); // Start of the day 'days' ago
    
    console.log(`Fetching stats from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Query Firestore for all daily stats documents within the date range for this user
    const statsCollection = collection(db, DAILY_STATS_COLLECTION);
    // We don't want to filter the query initially, as we need to check document IDs
    const statsQuery = query(statsCollection);
    const querySnapshot = await getDocs(statsQuery);
    
    console.log(`Total documents in collection: ${querySnapshot.size}`);
    
    // Process the documents to extract stats
    const dailyStatsMap = new Map<string, {
      lessonPlans: number;
      questionSets: number;
      presentations: number;
      notes: number;
      flashcards: number;
      date: Date;
    }>();
    
    // Debug: Log all document IDs to help diagnose issues
    console.log('All document IDs:');
    querySnapshot.forEach(doc => {
      console.log(`- ${doc.id}`);
    });
    
    // Filter documents by userId and date range
    querySnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Processing document ${doc.id}:`, data);
      
      // Check if this document belongs to the current user
      if (data.userId !== userId) {
        console.log(`Skipping document ${doc.id} - wrong user ID: ${data.userId}`);
        return;
      }
      
      // Convert Firestore timestamp to Date
      let docDate;
      try {
        if (data.date?.toDate) {
          docDate = data.date.toDate();
        } else if (data.date) {
          docDate = new Date(data.date);
        } else {
          console.log(`Skipping document ${doc.id} - no date field`);
          return;
        }
      } catch (error) {
        console.error(`Error parsing date for document ${doc.id}:`, error);
        return;
      }
      
      console.log(`Document ${doc.id} date:`, docDate);
      
      // Check if the date is within our range
      if (docDate >= startDate && docDate <= endDate) {
        const dateKey = docDate.toISOString().split('T')[0]; // YYYY-MM-DD
        console.log(`Adding stats for ${dateKey}`);
        
        // If we already have stats for this date, merge them
        const existingStats = dailyStatsMap.get(dateKey);
        if (existingStats) {
          console.log(`Merging with existing stats for ${dateKey}`);
          dailyStatsMap.set(dateKey, {
            lessonPlans: (existingStats.lessonPlans || 0) + (data.lessonPlans || 0),
            questionSets: (existingStats.questionSets || 0) + (data.questionSets || 0),
            presentations: (existingStats.presentations || 0) + (data.presentations || 0),
            notes: (existingStats.notes || 0) + (data.notes || 0),
            flashcards: (existingStats.flashcards || 0) + (data.flashcards || 0),
            date: docDate
          });
        } else {
          dailyStatsMap.set(dateKey, {
            lessonPlans: data.lessonPlans || 0,
            questionSets: data.questionSets || 0,
            presentations: data.presentations || 0,
            notes: data.notes || 0,
            flashcards: data.flashcards || 0,
            date: docDate
          });
        }
      } else {
        console.log(`Skipping document ${doc.id} - date out of range: ${docDate}`);
      }
    });
    
    console.log(`Found ${dailyStatsMap.size} days with stats data`);
    
    // Debug: Log all dates and their stats
    console.log('Daily stats by date:');
    for (const [dateKey, stats] of dailyStatsMap.entries()) {
      console.log(`- ${dateKey}:`, stats);
    }
    
    // If we have no data, return empty dataset
    if (dailyStatsMap.size === 0) {
      console.log('No stats data found for this time range');
      return [];
    }
    
    // For short time ranges (30 days or less), don't group data to show each day individually
    if (days <= 30 && dailyStatsMap.size <= 30) {
      console.log('Using daily data without grouping for short time range');
      
      // Convert the map directly to chart data format
      const result = Array.from(dailyStatsMap.entries()).map(([dateKey, stats]) => {
        const date = new Date(dateKey);
        return {
          name: `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`,
          'Lesson Plans': stats.lessonPlans,
          'Question Sets': stats.questionSets,
          'Presentations': stats.presentations,
          'Class Notes': stats.notes,
          'Flash Cards': stats.flashcards
        };
      }).sort((a, b) => {
        // Sort by date
        const dateA = new Date(`${a.name} 2000`);
        const dateB = new Date(`${b.name} 2000`);
        return dateA.getTime() - dateB.getTime();
      });
      
      console.log('Processed daily data for chart:', result);
      return result;
    }
    
    // For longer time ranges, group data by intervals
    // Determine the interval for grouping data points based on the time range
    const interval = days <= 30 ? 5 : days <= 60 ? 10 : 15;
    console.log(`Grouping data with interval of ${interval} days`);
    
    // Create a map to store data for each interval
    const intervalGroups = new Map<string, ContentGenerationData>();
    
    // Create date buckets for each interval
    for (let i = 0; i <= days; i += interval) {
      const bucketDate = new Date(startDate);
      bucketDate.setDate(bucketDate.getDate() + i);
      
      const bucketKey = `${bucketDate.getDate()} ${bucketDate.toLocaleString('default', { month: 'short' })}`;
      
      intervalGroups.set(bucketKey, {
        name: bucketKey,
        'Lesson Plans': 0,
        'Question Sets': 0,
        'Presentations': 0,
        'Class Notes': 0,
        'Flash Cards': 0
      });
    }
    
    // Distribute the actual data into the interval buckets
    for (const [dateKey, stats] of dailyStatsMap.entries()) {
      const date = new Date(dateKey);
      
      // Find the closest bucket for this date
      let closestBucket = '';
      let smallestDiff = Infinity;
      
      for (const bucketKey of intervalGroups.keys()) {
        const bucketParts = bucketKey.split(' ');
        const bucketDay = parseInt(bucketParts[0]);
        const bucketMonth = new Date(`${bucketParts[1]} 1, 2000`).getMonth();
        
        const bucketDate = new Date(date);
        bucketDate.setDate(bucketDay);
        bucketDate.setMonth(bucketMonth);
        
        const diff = Math.abs(date.getTime() - bucketDate.getTime());
        
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestBucket = bucketKey;
        }
      }
      
      if (closestBucket && intervalGroups.has(closestBucket)) {
        const bucket = intervalGroups.get(closestBucket)!;
        console.log(`Adding stats from ${dateKey} to bucket ${closestBucket}`);
        
        // Add the stats to the bucket
        bucket['Lesson Plans'] += stats.lessonPlans;
        bucket['Question Sets'] += stats.questionSets;
        bucket['Presentations'] += stats.presentations;
        bucket['Class Notes'] += stats.notes;
        bucket['Flash Cards'] += stats.flashcards;
      }
    }
    
    // Convert the map to an array and sort by date
    const result = Array.from(intervalGroups.values())
      .filter(bucket => {
        // Only include buckets that have at least one non-zero value
        return (
          bucket['Lesson Plans'] > 0 ||
          bucket['Question Sets'] > 0 ||
          bucket['Presentations'] > 0 ||
          bucket['Class Notes'] > 0 ||
          bucket['Flash Cards'] > 0
        );
      })
      .sort((a, b) => {
        // Sort by date (assuming format is 'DD MMM')
        const dateA = new Date(`${a.name} 2000`);
        const dateB = new Date(`${b.name} 2000`);
        return dateA.getTime() - dateB.getTime();
      });
    
    console.log('Processed grouped data for chart:', result);
    return result;
  } catch (error) {
    console.error('Error in getDailyContentStats:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // Try to return empty data first, then fall back to sample data if needed
    try {
      return generateEmptyDataSet(days);
    } catch (innerError) {
      console.error('Error generating empty data set, falling back to sample data:', innerError);
      return generateSampleDataSet(days);
    }
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
 * Generate sample data for the chart when no real data is available
 * This is used for testing and development purposes
 */
const generateSampleDataSet = (days: TimeRange): ContentGenerationData[] => {
  const result: ContentGenerationData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Determine the interval based on the days
  const interval = days <= 30 ? 5 : days <= 60 ? 10 : 15;
  
  // Create sample data points with random values
  for (let i = days; i >= 0; i -= interval) {
    const bucketDate = new Date(today);
    bucketDate.setDate(bucketDate.getDate() - i);
    
    // Generate random values between 0-5 for each content type
    // Make more recent dates have higher values to show a trend
    const factor = 1 - (i / days); // 0 to 1, higher for more recent dates
    const baseValue = Math.floor(factor * 5);
    
    result.push({
      name: `${bucketDate.getDate()} ${bucketDate.toLocaleString('default', { month: 'short' })}`,
      'Lesson Plans': Math.max(0, baseValue + Math.floor(Math.random() * 3)),
      'Question Sets': Math.max(0, baseValue + Math.floor(Math.random() * 3)),
      'Presentations': Math.max(0, baseValue + Math.floor(Math.random() * 3)),
      'Class Notes': Math.max(0, baseValue + Math.floor(Math.random() * 3)),
      'Flash Cards': Math.max(0, baseValue + Math.floor(Math.random() * 3))
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
 * Test function to generate realistic test data for the content generation chart
 * This creates data for the past 90 days with varying amounts of content generation
 */
export const testDailyContentStats = async (userId: string): Promise<void> => {
  try {
    console.log('=== GENERATING TEST DATA FOR CONTENT STATS ===');
    console.log('Generating data for userId:', userId);
    
    // Generate data for the past 90 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // First, clear any existing test data for this user
    console.log('Checking for existing data...');
    
    // Generate data for each day with some randomness to make it realistic
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Initialize stats for this date
      console.log(`Initializing stats for day -${i}:`, date.toISOString().split('T')[0]);
      await initializeDailyStats(userId, date);
      
      // Generate random content based on day of week and recency
      // More recent days have higher probability of content
      // Weekdays have more content than weekends
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const recencyFactor = Math.min(1, (90 - i) / 60); // 0 to 1, higher for more recent days
      
      // Base probability adjusted for weekends and recency
      const baseProbability = isWeekend ? 0.3 : 0.6;
      const adjustedProbability = baseProbability * (0.5 + recencyFactor * 0.5);
      
      // Generate random content with varying probabilities
      const contentTypes = ['lessonPlans', 'questionSets', 'presentations', 'notes', 'flashcards'];
      for (const type of contentTypes) {
        // Different content types have different frequencies
        let typeMultiplier = 1.0;
        if (type === 'lessonPlans') typeMultiplier = 0.8;
        if (type === 'questionSets') typeMultiplier = 1.2;
        if (type === 'presentations') typeMultiplier = 0.7;
        if (type === 'notes') typeMultiplier = 1.5;
        if (type === 'flashcards') typeMultiplier = 0.9;
        
        // Calculate probability for this content type
        const probability = adjustedProbability * typeMultiplier;
        
        // Determine if content was generated on this day
        if (Math.random() < probability) {
          // Generate 1-3 items of this type
          const count = Math.floor(Math.random() * 3) + 1;
          
          // Update the stats for this content type
          for (let j = 0; j < count; j++) {
            await updateDailyContentStats(userId, {
              type: type as any,
              operation: 'increment'
            }, date);
          }
          
          console.log(`Generated ${count} ${type} for ${date.toISOString().split('T')[0]}`);
        }
      }
    }
    
    // Verify the data was created
    console.log('Verifying generated data...');
    const stats30 = await getDailyContentStats(userId, 30);
    const stats60 = await getDailyContentStats(userId, 60);
    const stats90 = await getDailyContentStats(userId, 90);
    
    console.log('30-day stats count:', stats30.length);
    console.log('60-day stats count:', stats60.length);
    console.log('90-day stats count:', stats90.length);
    
    console.log('=== TEST DATA GENERATION COMPLETED SUCCESSFULLY ===');
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
