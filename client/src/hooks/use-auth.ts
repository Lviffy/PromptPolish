import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import * as React from 'react';
import { User } from "@shared/schema";
// Import Supabase auth functions
import { signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut, getCurrentUser as supabaseGetCurrentUser, convertToAppUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase"; // Import supabase client for onAuthStateChange
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

// Auth hook implementation
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const appUser = await supabaseGetCurrentUser();
        setUser(appUser);
      } catch (e) {
        // console.error("Error checking user on mount:", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(convertToAppUser(session.user));
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem("prompt_enhancer_user"); // Clear local storage on sign out
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // supabaseSignIn from lib/auth.ts returns { user, session } or throws an error
      const result = await supabaseSignIn(email, password);
      if (result.user) {
        const appUser = convertToAppUser(result.user);
        setUser(appUser);
        localStorage.setItem("prompt_enhancer_user", JSON.stringify(appUser));
        setIsLoading(false);
        return appUser;
      }
      setIsLoading(false);
      return null;
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // supabaseSignUp from lib/auth.ts returns { user, session, message } or throws an error
      const result = await supabaseSignUp(email, password, username);
      
      if (result.message) { // Handle cases like email confirmation pending
        toast({
          title: "Registration Information",
          description: result.message,
        });
        setIsLoading(false);
        // User might be created but needs confirmation, so don't set user yet
        // or set a partial user state if your app handles that
        return null; 
      }

      if (result.user) {
        const appUser = convertToAppUser(result.user);
        setUser(appUser);
        // If auto-login after signup & confirmation is not immediate,
        // onAuthStateChange will handle setting the user once confirmed and signed in.
        // localStorage.setItem("prompt_enhancer_user", JSON.stringify(appUser)); 
        toast({
          title: "Registration Successful",
          description: "Please check your email to confirm your account if required.",
        });
        setIsLoading(false);
        return appUser; // Or null if email confirmation is strictly required before app access
      }
      setIsLoading(false);
      return null;
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Registration Failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabaseSignOut();
      setUser(null); // onAuthStateChange will also set user to null
      localStorage.removeItem("prompt_enhancer_user");
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Logout Failed",
        description: error.message || "Could not log out. Please try again.",
        variant: "destructive",
      });
      throw error;
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
