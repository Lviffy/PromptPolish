import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  Auth,
  User,
  UserCredential,
  PopupRedirectResolver,
  AuthProvider,
  AuthError
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// For development mode - use mock Firebase implementations
const isDevelopment = true; // Set to true for development, false for production

// Only import Firebase if not in development mode
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null;
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

// Auth helper functions
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await auth.signInWithPopup(googleProvider);
    const user = result.user;
    
    // Check if user profile exists, if not create one with username from email
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const username = user.displayName || user.email?.split('@')[0] || 'User';
      
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        username: username,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString()
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const registerWithEmail = async (
  email: string, 
  password: string, 
  username: string
): Promise<User> => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with username
    await updateProfile(user, { displayName: username });
    
    // Create user document in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      username,
      displayName: username,
      createdAt: new Date().toISOString()
    });
    
    return user;
  } catch (error) {
    console.error('Error registering with email:', error);
    throw error;
  }
};

export const loginWithEmail = async (
  email: string, 
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in with email:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Helper function to handle Firebase errors
export function handleFirebaseError(error: any): string {
  const errorCode = error?.code as string;
  const errorMessage: {[key: string]: string} = {
    'auth/user-not-found': 'No user found with this email address',
    'auth/wrong-password': 'Invalid password',
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completing',
    'auth/operation-not-allowed': 'This sign-in method is not enabled',
    'auth/network-request-failed': 'Network error, please check your connection',
  };

  return errorCode && errorMessage[errorCode] ? errorMessage[errorCode] : error?.message || 'An unexpected error occurred';
}