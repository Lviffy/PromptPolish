import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Determine if we have valid Firebase config
const hasValidConfig = 
  !!import.meta.env.VITE_FIREBASE_API_KEY && 
  !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;

// Initialize app, auth, and analytics variables
let app;
let auth;
let analytics = null;

// If we have valid config OR we're in production, initialize Firebase with real config
if (hasValidConfig || !isDevelopment) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Initialize Analytics only in production
  if (import.meta.env.PROD) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }
} else {
  // We're in development and don't have valid Firebase config
  console.warn('Using mock Firebase implementation for development. Create a .env file with proper Firebase values for full functionality.');
  
  // Create a more comprehensive mock app object
  app = {
    name: '[DEFAULT]',
    options: {},
    automaticDataCollectionEnabled: false,
    _getProvider: () => {
      return {
        getImmediate: () => ({})
      };
    }
  };
  
  // Create a more comprehensive mock auth object with required methods
  const mockCurrentUser = null;
  
  auth = {
    app,
    name: '[DEFAULT]',
    config: {
      apiKey: 'fake-api-key',
      authDomain: 'localhost',
    },
    currentUser: mockCurrentUser,
    languageCode: 'en',
    tenantId: null,
    settings: {
      appVerificationDisabledForTesting: true,
    },
    onAuthStateChanged: (callback) => {
      // Call the callback with null user (not authenticated)
      setTimeout(() => callback(mockCurrentUser), 0);
      
      // Return unsubscribe function
      return () => {};
    },
    signInWithPopup: () => Promise.reject(new Error('Mock auth: signInWithPopup not implemented')),
    signInWithEmailAndPassword: () => Promise.reject(new Error('Mock auth: signInWithEmailAndPassword not implemented')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Mock auth: createUserWithEmailAndPassword not implemented')),
    signOut: () => Promise.resolve(),
    getProvider: (providerId) => {
      return {
        providerId,
        getImmediate: () => ({})
      };
    }
  };
  
  // Create a mock analytics object
  analytics = {
    app,
    logEvent: () => {},
    setCurrentScreen: () => {},
    setUserId: () => {},
    setUserProperties: () => {}
  };
}

export { app, auth, analytics };