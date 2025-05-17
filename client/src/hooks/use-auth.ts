import { useState, useEffect } from "react";
import { supabase, signIn, signUp, signOut, getCurrentUser } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import * as React from 'react';

// Auth hook implementation
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );
    
    checkUser();
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: authUser } = await signIn(email, password);
      setUser(authUser);
      return authUser;
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
      const { user: authUser } = await signUp(email, password, username);
      
      // Insert the user into our users table with additional info
      if (authUser?.id) {
        // Create user profile in the users table
        const { error } = await supabase
          .from('users')
          .insert([{ 
            id: authUser.id, 
            username, 
            email 
          }]);
          
        if (error) throw error;
      }
      
      setUser(authUser);
      return authUser;
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
      await signOut();
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

// Simple compatibility wrapper
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}
