import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  AuthError,
  onAuthStateChanged,
  Auth
} from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle as firebaseSignInWithGoogle,
  handleGoogleRedirect,
  loginWithEmail as firebaseLoginWithEmail,
  registerWithEmail as firebaseRegisterWithEmail,
  signOutUser as firebaseSignOut,
  handleFirebaseError,
  db
} from './firebase';
import { doc, getDoc, Firestore } from 'firebase/firestore';

// Type assertions for Firebase services
const firebaseAuth = auth as Auth;
const firebaseDB = db as Firestore;

// Types
type UserProfile = {
  uid: string;
  email: string | null;
  username: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
};

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get user profile data from Firestore
  const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      // Make sure we're using the Firestore instance
      if (!db) {
        console.error('Firestore is not initialized');
        return null;
      }
      
      // Create proper document reference
      const userRef = doc(db as Firestore, 'users', uid);
      
      // Get document snapshot
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };
  
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        // Check for any Google sign-in redirect results
        const redirectUser = await handleGoogleRedirect();
        if (redirectUser) {
          setUser(redirectUser);
          const profile = await getUserProfile(redirectUser.uid);
          if (profile) {
            setUserProfile({
              ...profile,
              emailVerified: redirectUser.emailVerified,
            } as UserProfile);
          }
        }
      } catch (error: any) {
        console.error('Error handling redirect result:', error);
        setError(handleFirebaseError(error));
      }
    };

    // Handle the redirect result when the component mounts
    handleRedirectResult();
    
    // Set up Firebase auth listener
    try {
      // Make sure we have auth before setting up listeners
      if (!auth) {
        console.error('Firebase Auth is not available');
        setError('Authentication service is not available');
        setIsLoading(false);
        return () => {};
      }

      const unsubscribe = onAuthStateChanged(
        auth as Auth, 
        async (authUser: User | null) => {
          setIsLoading(true);
          
          if (authUser) {
            setUser(authUser);
            
            try {
              // Get additional user profile from Firestore
              const profile = await getUserProfile(authUser.uid);
              
              if (profile) {
                setUserProfile({
                  ...profile,
                  emailVerified: authUser.emailVerified,
                } as UserProfile);
              } else {
                // If no profile exists yet, create a basic one from auth data
                setUserProfile({
                  uid: authUser.uid,
                  email: authUser.email,
                  username: authUser.displayName?.split(' ')[0].toLowerCase() || authUser.email?.split('@')[0] || 'user',
                  displayName: authUser.displayName,
                  photoURL: authUser.photoURL,
                  emailVerified: authUser.emailVerified,
                });
              }
            } catch (error) {
              console.error('Error getting user profile:', error);
              // Create a basic profile even if Firestore fails
              setUserProfile({
                uid: authUser.uid,
                email: authUser.email,
                username: authUser.displayName?.split(' ')[0].toLowerCase() || authUser.email?.split('@')[0] || 'user',
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
                emailVerified: authUser.emailVerified,
              });
            }
          } else {
            setUser(null);
            setUserProfile(null);
          }
          
          setIsLoading(false);
          setError(null);
        }, 
        (error: Error) => {
          console.error('Auth state change error:', error);
          setError(handleFirebaseError(error));
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (initError) {
      console.error('Firebase auth initialization error:', initError);
      setError('Failed to initialize authentication. Please try again later.');
      setIsLoading(false);
      return () => {};
    }
  }, []);

  // Sign in with Google - starts the redirect flow
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // This will redirect to Google sign-in page
      await firebaseSignInWithGoogle();
      // No user is returned immediately as this is a redirect flow
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(handleFirebaseError(error));
      setIsLoading(false);
      throw error;
    }
    // Note: Don't set isLoading to false here since the page will redirect
  };

  // Login with email/password
  const loginWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await firebaseLoginWithEmail(email, password);
      setUser(user);
    } catch (error: any) {
      console.error('Email login error:', error);
      setError(handleFirebaseError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register with email/password
  const registerWithEmail = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await firebaseRegisterWithEmail(email, password, username);
      setUser(user);
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(handleFirebaseError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      await firebaseSignOut();
      setUser(null);
      setUserProfile(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(handleFirebaseError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    isAuthenticated: !!user,
    isLoading,
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
    signOut,
    error,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use Auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 