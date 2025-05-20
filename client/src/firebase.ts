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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with custom persistence
const auth = getAuth(app);

// Initialize Analytics only in production
let analytics = null;
if (import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Export the Firebase services
export const db = getFirestore(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth helper functions
export const signInWithGoogle = async (): Promise<User> => {
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

export { app, auth, analytics };