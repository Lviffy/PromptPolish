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
  AuthError
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Import the firebase config from root firebase.ts
import { app as firebaseApp, auth as firebaseAuth, analytics as firebaseAnalytics } from '../firebase';

// Determine if we're in development mode without valid Firebase config
const isDev = import.meta.env.DEV && 
  (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);

// Export the Firebase services
export const auth = firebaseAuth;

// Define db variable
let db;

// Create a mock Firestore or use the real one
if (isDev) {
  // Create a mock Firestore implementation
  db = {
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: () => false,
          data: () => ({}),
        }),
        set: async () => {},
        update: async () => {},
      }),
    }),
    doc: (collection, id) => ({
      get: async () => ({
        exists: () => false,
        data: () => ({}),
      }),
      set: async () => {},
    }),
  };
} else {
  // Use the real Firestore DB
  db = getFirestore(firebaseApp);
}

// Export the db
export { db };

export const analytics = firebaseAnalytics;

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth helper functions
export const signInWithGoogle = async (): Promise<User> => {
  if (isDev) {
    console.log('Using mock signInWithGoogle implementation');
    // Return a mock user
    return {
      uid: 'mock-user-123',
      email: 'mockuser@example.com',
      displayName: 'Mock User',
      photoURL: 'https://via.placeholder.com/150',
      emailVerified: true,
    } as User;
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
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
  if (isDev) {
    console.log('Using mock registerWithEmail implementation');
    // Return a mock user
    return {
      uid: 'mock-user-123',
      email,
      displayName: username,
      photoURL: null,
      emailVerified: false,
    } as User;
  }
  
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
  if (isDev) {
    console.log('Using mock loginWithEmail implementation');
    // Return a mock user
    return {
      uid: 'mock-user-123',
      email,
      displayName: 'Mock User',
      photoURL: 'https://via.placeholder.com/150',
      emailVerified: true,
    } as User;
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in with email:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  if (isDev) {
    console.log('Using mock signOut implementation');
    return;
  }
  
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