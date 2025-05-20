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
  signInWithPopup,
  AuthError,
  browserLocalPersistence,
  setPersistence,
  sendPasswordResetEmail,
  sendEmailVerification,
  verifyBeforeUpdateEmail
} from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Firebase configuration with all required fields
const firebaseConfig = {
  apiKey: "AIzaSyDTDOjpP-179tjaRzirz4auVNfPbxzlu9k",
  authDomain: "promptpolish-1.firebaseapp.com",
  projectId: "promptpolish-1",
  storageBucket: "promptpolish-1.appspot.com",
  messagingSenderId: "169615528437",
  appId: "1:169615528437:web:02d00b2ae6ef6476fa90bc",
  measurementId: "G-G046C4BSKV"
};

// Initialize Firebase app first
const app = initializeApp(firebaseConfig);

// Initialize Auth with local persistence
const auth = getAuth(app);

// Set authentication persistence to LOCAL for better user experience
try {
  setPersistence(auth, browserLocalPersistence)
    .catch(err => {
      console.error('Error setting auth persistence:', err);
    });
} catch (err) {
  console.error('Error configuring auth persistence:', err);
}

// Initialize Analytics
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.error('Analytics initialization failed:', error);
}

// Initialize Firestore - BUT DO NOT IMPORT DIRECTLY
// We use a function to lazily import and initialize to avoid the persistence error
let _db = null;

// This function ensures Firestore is only initialized once with persistence enabled
const getFirestoreDB = async () => {
  if (_db !== null) return _db;
  
  try {
    // Dynamically import Firestore to ensure it's not initialized at module load time
    const { getFirestore, enableIndexedDbPersistence } = await import('firebase/firestore');
    
    // Initialize Firestore
    _db = getFirestore(app);
    
    // Try to enable persistence
    try {
      await enableIndexedDbPersistence(_db);
      console.log('Firestore offline persistence enabled');
    } catch (err) {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence unavailable in multiple tabs');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not supported by this browser');
      } else {
        console.error('Could not enable offline persistence:', err);
      }
    }
    
    return _db;
  } catch (err) {
    console.error('Error with Firestore initialization:', err);
    
    // Fallback to initialize without trying persistence
    const { getFirestore } = await import('firebase/firestore');
    _db = getFirestore(app);
    return _db;
  }
};

// Configure Google Auth Provider with recommended settings
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Add scopes for better user profile data
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Auth helper functions
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create/update user profile
    try {
      await createUserProfileIfNeeded(user);
    } catch (profileError) {
      console.error('Failed to create user profile, but authentication succeeded:', profileError);
    }
    
    return user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Helper function to create user profile
async function createUserProfileIfNeeded(user: User) {
  try {
    // Get Firestore imports dynamically to avoid initialization issues
    const { doc, getDoc, setDoc } = await import('firebase/firestore');
    const db = await getFirestoreDB();
    
    // Check if user profile exists, if not create one with username from email
    const userRef = doc(db, 'users', user.uid);
    
    try {
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const username = user.displayName || user.email?.split('@')[0] || 'User';
        
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          username: username,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

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
    
    // Send email verification
    try {
      await sendEmailVerification(user);
    } catch (verificationError) {
      console.error('Failed to send verification email, but user was created:', verificationError);
    }
    
    // Create user document in Firestore
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const db = await getFirestoreDB();
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        username,
        displayName: username,
        emailVerified: false,
        createdAt: new Date().toISOString()
      });
    } catch (firestoreError) {
      console.error('Failed to create Firestore profile, but user was created:', firestoreError);
    }
    
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

// Add password reset functionality
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Add email verification functionality
export const verifyEmail = async (user: User): Promise<void> => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Allow users to update their email with verification
export const updateUserEmail = async (user: User, newEmail: string): Promise<void> => {
  try {
    await verifyBeforeUpdateEmail(user, newEmail);
  } catch (error) {
    console.error('Error updating user email:', error);
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
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please log in again.',
    'auth/email-already-exists': 'The email address is already in use by another account',
    'auth/expired-action-code': 'The action code has expired. Please request a new one',
    'auth/invalid-action-code': 'The action code is invalid. This can happen if it has already been used',
    'permission-denied': 'You don\'t have permission to access this data',
  };

  return errorCode && errorMessage[errorCode] ? errorMessage[errorCode] : error?.message || 'An unexpected error occurred';
}

// Export auth and analytics directly
export { app, auth, analytics };

// Export a function to get the database instead of the database itself
export { getFirestoreDB as getDb };