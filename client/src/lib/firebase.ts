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
  signInWithRedirect,
  getRedirectResult,
  AuthError
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Import the firebase config from root firebase.ts
import { app, auth, analytics } from '../firebase';

// Initialize Firestore
const db = getFirestore(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Add these scopes for better profile data
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Auth helper functions
export const signInWithGoogle = async (): Promise<User> => {
  try {
    // Use popup auth with error handling
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create/update user profile
    await createUserProfileIfNeeded(user);
    
    return user;
  } catch (error: any) {
    // Check for popup blocked error
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/popup-closed-by-user') {
      console.log('Popup was blocked, trying redirect...');
      try {
        // Fall back to redirect
        await signInWithRedirect(auth, googleProvider);
        // This won't return immediately as it redirects
        return {} as User;
      } catch (redirectError) {
        console.error('Error during redirect sign in:', redirectError);
        throw redirectError;
      }
    }
    
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Handle redirect result from Google sign-in
export const handleGoogleRedirect = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      
      // Create/update user profile
      await createUserProfileIfNeeded(user);
      
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error handling Google redirect:', error);
    throw error;
  }
};

// Helper function to create user profile
async function createUserProfileIfNeeded(user: User) {
  try {
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
  } catch (error) {
    console.error('Error creating user profile:', error);
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

export { auth, db, analytics };