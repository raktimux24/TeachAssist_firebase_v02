import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Determine if we're in production
const isProd = import.meta.env.PROD;

// Hardcoded Firebase configuration as fallback
const hardcodedConfig = {
  apiKey: "AIzaSyDbGKrqjBca6ktNrD-qPWm2uBkgT1t4s14",
  authDomain: "teachassistpro.firebaseapp.com",
  projectId: "teachassistpro",
  storageBucket: "teachassistpro.firebasestorage.app",
  messagingSenderId: "629324182595",
  appId: "1:629324182595:web:84bf6bc29b4fb7cff4d0f6",
  measurementId: "G-PC98ZDVNT3"
};

// Firebase configuration - use environment variables if available, otherwise use hardcoded config
const firebaseConfig = {
  apiKey: isProd 
    ? import.meta.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || hardcodedConfig.apiKey
    : import.meta.env.VITE_FIREBASE_API_KEY || hardcodedConfig.apiKey,
  authDomain: isProd 
    ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || hardcodedConfig.authDomain
    : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || hardcodedConfig.authDomain,
  projectId: isProd 
    ? import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || hardcodedConfig.projectId
    : import.meta.env.VITE_FIREBASE_PROJECT_ID || hardcodedConfig.projectId,
  storageBucket: isProd 
    ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || hardcodedConfig.storageBucket
    : import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || hardcodedConfig.storageBucket,
  messagingSenderId: isProd 
    ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || hardcodedConfig.messagingSenderId
    : import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || hardcodedConfig.messagingSenderId,
  appId: isProd 
    ? import.meta.env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || hardcodedConfig.appId
    : import.meta.env.VITE_FIREBASE_APP_ID || hardcodedConfig.appId,
  measurementId: isProd 
    ? import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID || hardcodedConfig.measurementId
    : import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || hardcodedConfig.measurementId
};

// Log configuration in development (not in production for security)
if (!isProd) {
  console.log('Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? '***' : 'missing',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId ? '***' : 'missing',
    measurementId: firebaseConfig.measurementId
  });
}

// Check if API key is available
if (!firebaseConfig.apiKey) {
  console.error('Firebase API key is missing. Please check your environment variables.');
}

// Validate that we're connecting to the correct project
if (firebaseConfig.projectId !== 'teachassistpro') {
  console.warn(`Warning: Connected to project ${firebaseConfig.projectId} instead of teachassistpro`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulator if in development and VITE_USE_FIREBASE_EMULATOR is set
if (!isProd && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Connected to Firestore emulator on localhost:8080');
  } catch (error) {
    console.error('Failed to connect to Firestore emulator:', error);
  }
}

export default app;
