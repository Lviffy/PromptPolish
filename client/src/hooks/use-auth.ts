import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import * as React from 'react';
import { User } from "@shared/schema";
import { supabase } from "@/lib/supabase";
import { signIn, signUp, signOut, convertToAppUser, getCurrentUser } from "@/lib/auth";

// Auth hook implementation
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const appUser = await getCurrentUser();
        setUser(appUser);
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(convertToAppUser(session.user));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    checkUser();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: supabaseUser } = await signIn(email, password);
      
      if (supabaseUser) {
        const appUser = convertToAppUser(supabaseUser);
        setUser(appUser);
        return appUser;
      }
      
      throw new Error("Login failed");
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
      const { user: supabaseUser, message } = await signUp(email, password, username);
      
      // If email confirmation is required
      if (message && !supabaseUser) {
        toast({
          title: "Sign Up Successful",
          description: message,
        });
        return null;
      }
      
      if (supabaseUser) {
        const appUser = convertToAppUser(supabaseUser);
        setUser(appUser);
        return appUser;
      }
      
      throw new Error("Registration failed");
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
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to log out.",
        variant: "destructive",
      });
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
