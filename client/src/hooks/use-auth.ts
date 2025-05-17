import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import * as React from 'react';
import { User } from "@shared/schema";

// Auth hook implementation
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check if user is signed in with Supabase
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          // Convert Supabase user to our User type
          const appUser: User = {
            id: parseInt(authUser.id, 36) % 1000000, // Generate numeric ID from UUID
            username: authUser.user_metadata.username || authUser.email?.split('@')[0] || '',
            email: authUser.email || '',
            password: '' // We don't store or use passwords client-side
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const authUser = session.user;
          // Convert to our User type
          const appUser: User = {
            id: parseInt(authUser.id, 36) % 1000000,
            username: authUser.user_metadata.username || authUser.email?.split('@')[0] || '',
            email: authUser.email || '',
            password: ''
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const appUser: User = {
          id: parseInt(data.user.id, 36) % 1000000,
          username: data.user.user_metadata.username || data.user.email?.split('@')[0] || '',
          email: data.user.email || '',
          password: ''
        };
        setUser(appUser);
        return appUser;
      }
      
      throw new Error("Failed to get user data");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        const appUser: User = {
          id: parseInt(data.user.id, 36) % 1000000,
          username,
          email: data.user.email || '',
          password: ''
        };
        setUser(appUser);
        
        // Note: With Supabase, we don't need to manually insert rows to a users table
        // as the auth system handles user management for us
        
        return appUser;
      }
      
      throw new Error("Failed to create user");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}
