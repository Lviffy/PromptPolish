import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from './firebase';

// Define a lightweight User type similar to Firebase User
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

type User = MockUser;

// Types
interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For development: set to true to enable mock authentication
  const useMockAuth = true;
  
  useEffect(() => {
    if (useMockAuth) {
      // Mock authentication for development
      const mockUser = {
        uid: 'mock-user-123',
        email: 'user@example.com',
        displayName: 'Test User',
        photoURL: 'https://via.placeholder.com/150',
        emailVerified: true,
      };
      
      setCurrentUser(mockUser);
      setIsLoading(false);
      return () => {};
    }
  
    // Auth listener - using our potentially mocked auth object
    const unsubscribe = auth.onAuthStateChanged ? 
      auth.onAuthStateChanged((user: any) => {
        setCurrentUser(user);
        setIsLoading(false);
        setError(null);
      }, (error: any) => {
        console.error('Auth state change error:', error);
        setError(error.message);
        setIsLoading(false);
      }) : 
      (() => {});

    return unsubscribe;
  }, [useMockAuth]);

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
      };
      
      setCurrentUser(mockUser);
      return;
    }
    
    try {
      setIsLoading(true);
      // Only try to use Firebase auth if signInWithPopup is available
      if (auth.signInWithPopup) {
        await auth.signInWithPopup(googleProvider);
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    if (useMockAuth) {
      // Mock sign out
      setCurrentUser(null);
      return;
    }
    
    try {
      setIsLoading(true);
      // Only try to use Firebase auth if signOut is available
      if (auth.signOut) {
        await auth.signOut();
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    signInWithGoogle,
    signOut,
    error,
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