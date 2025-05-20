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
  AuthError,
  browserLocalPersistence,
  setPersistence,
  sendPasswordResetEmail,
  sendEmailVerification,
  verifyBeforeUpdateEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  Firestore, 
  enableIndexedDbPersistence 
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Import the firebase config from root firebase.ts
import { app, auth, analytics } from '../firebase';

// Initialize Firestore
const db = getFirestore(app);

// Enable offline persistence for Firestore
try {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log('Firestore persistence enabled');
    })
    .catch((err) => {
      console.warn('Firestore persistence couldn\'t be enabled:', err.code);
    });
} catch (err) {
  console.warn('Error enabling Firestore persistence:', err);
}

// Set authentication persistence to LOCAL
try {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Auth persistence set to LOCAL');
    })
    .catch(err => {
      console.warn('Error setting auth persistence:', err);
    });
} catch (err) {
  console.warn('Error configuring auth persistence:', err);
}

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
    try {
      await createUserProfileIfNeeded(user);
    } catch (profileError) {
      console.warn('Failed to create user profile, but authentication succeeded:', profileError);
    }
    
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
      try {
        await createUserProfileIfNeeded(user);
      } catch (profileError) {
        console.warn('Failed to create user profile after redirect, but authentication succeeded:', profileError);
      }
      
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
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      // Handle Firestore permissions error specifically
      if (error instanceof Error && error.message.includes('permission-denied')) {
        console.warn('Permission denied when accessing Firestore. User is authenticated but may have limited functionality.');
      } else {
        throw error;
      }
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
      console.warn('Failed to send verification email, but user was created:', verificationError);
    }
    
    // Create user document in Firestore - wrapped in try/catch to handle permissions errors
    try {
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
      console.warn('Failed to create Firestore profile, but user was created:', firestoreError);
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

export { auth, db, analytics };