import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Determine if we're in production
const isProd = import.meta.env.PROD;

// Firebase configuration
const firebaseConfig = {
  apiKey: isProd 
    ? import.meta.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY 
    : import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: isProd 
    ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN 
    : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: isProd 
    ? import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID 
    : import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: isProd 
    ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET 
    : import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: isProd 
    ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID 
    : import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: isProd 
    ? import.meta.env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID 
    : import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: isProd 
    ? import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID 
    : import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Log configuration in development (not in production for security)
if (!isProd) {
  console.log('Firebase Config:', JSON.stringify(firebaseConfig, null, 2));
}

// Check if API key is available
if (!firebaseConfig.apiKey) {
  console.error('Firebase API key is missing. Please check your environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
