import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  AuthError,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle as firebaseSignInWithGoogle,
  loginWithEmail as firebaseLoginWithEmail,
  registerWithEmail as firebaseRegisterWithEmail,
  signOutUser as firebaseSignOut,
  handleFirebaseError
} from './firebase';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

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

// Development flag - use this to bypass real Firebase auth during development
const useMockAuth = false; // Set to true for mock auth during development

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = getFirestore();
  
  // Get user profile data from Firestore
  const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', uid);
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
    // If using mock auth for development
    if (useMockAuth) {
      const mockUser = {
        uid: 'mock-user-123',
        email: 'user@example.com',
        displayName: 'Test User',
        photoURL: 'https://via.placeholder.com/150',
        emailVerified: true,
      } as User;
      
      const mockProfile = {
        uid: 'mock-user-123',
        email: 'user@example.com',
        username: 'testuser',
        displayName: 'Test User',
        photoURL: 'https://via.placeholder.com/150',
        emailVerified: true,
      };
      
      setUser(mockUser);
      setUserProfile(mockProfile);
      setIsLoading(false);
      return () => {};
    }
  
    // Real Firebase auth listener
    try {
      const unsubscribe = onAuthStateChanged(
        auth, 
        async (authUser: User | null) => {
          setIsLoading(true);
          
          if (authUser) {
            setUser(authUser);
            
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
  }, [useMockAuth, db]);

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (useMockAuth) {
      // Mock sign in
      const mockUser = {
        uid: 'mock-user-123',
        email: 'user@example.com',
        displayName: 'Test User',
        photoURL: 'https://via.placeholder.com/150',
        emailVerified: true,
      } as User;
      
      setUser(mockUser);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const user = await firebaseSignInWithGoogle();
      setUser(user);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(handleFirebaseError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with email/password
  const loginWithEmail = async (email: string, password: string) => {
    if (useMockAuth) {
      // Mock login
      const mockUser = {
        uid: 'mock-user-123',
        email,
        displayName: 'Test User',
        photoURL: 'https://via.placeholder.com/150',
        emailVerified: true,
      } as User;
      
      setUser(mockUser);
      return;
    }
    
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
    if (useMockAuth) {
      // Mock registration
      const mockUser = {
        uid: 'mock-user-123',
        email,
        displayName: username,
        photoURL: null,
        emailVerified: false,
      } as User;
      
      setUser(mockUser);
      return;
    }
    
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
    if (useMockAuth) {
      // Mock sign out
      setUser(null);
      setUserProfile(null);
      return;
    }
    
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