import { GoogleAuthProvider } from 'firebase/auth';

// For development mode - use mock Firebase implementations
const isDevelopment = true; // Set to true for development, false for production

// Only import Firebase if not in development mode
let auth;
let db;
let analytics;
let app;

if (!isDevelopment) {
  // Only import and initialize Firebase in production
  const { initializeApp } = require('firebase/app');
  const { getAuth } = require('firebase/auth');
  const { getFirestore } = require('firebase/firestore');
  const { getAnalytics, isSupported } = require('firebase/analytics');

  const firebaseConfig = {
    apiKey: "AIzaSyDummyKeyForTesting123456789",
    authDomain: "prompt-polish.firebaseapp.com",
    projectId: "prompt-polish",
    storageBucket: "prompt-polish.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890",
    measurementId: "G-ABCDEF1234"
  };

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Initialize analytics conditionally
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(err => {
    console.warn('Analytics not supported:', err);
  });
} else {
  // Mock implementations for development
  console.log('Using mock Firebase implementation for development');
  
  // Mock auth
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {}; // Unsubscribe function
    },
  };
  
  // Mock db
  db = {
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: false,
          data: () => ({}),
        }),
        set: async () => {},
        update: async () => {},
        delete: async () => {},
      }),
      add: async () => {},
      where: () => ({
        get: async () => ({
          docs: [],
        }),
      }),
    }),
  };
  
  // Mock analytics
  analytics = {
    logEvent: () => {},
  };
}

// Export the Firebase services
export { auth, db, analytics };

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Helper function to handle Firebase errors
export function handleFirebaseError(error: any) {
  console.error('Firebase error:', error);
  throw new Error(error.message || 'An unexpected error occurred');
}