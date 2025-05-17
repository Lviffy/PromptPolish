import { supabase } from "./supabase";
import { User } from "@shared/schema";

// Sign up a new user
export async function signUp(email: string, password: string, username: string) {
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
    
    // If signup succeeded but user needs to confirm email
    if (data.user && !data.session) {
      return { 
        user: null, 
        message: "Please check your email for a confirmation link" 
      };
    }
    
    return { user: data.user, session: data.session };
  } catch (error: any) {
    console.error("Error signing up:", error.message);
    throw error;
  }
}

// Sign in a user
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error: any) {
    console.error("Error signing in:", error.message);
    throw error;
  }
}

// Sign out a user
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error("Error signing out:", error.message);
    throw error;
  }
}

// Get the current logged in user
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (data.user) {
      // Convert Supabase user to our app's User format
      const appUser: User = {
        id: parseInt(data.user.id.substring(0, 8), 16) % 1000000, // Generate numeric ID
        username: data.user.user_metadata.username || data.user.email?.split('@')[0] || '',
        email: data.user.email || '',
        password: '' // We don't store passwords
      };
      return appUser;
    }
    
    return null;
  } catch (error: any) {
    console.error("Error getting current user:", error.message);
    return null;
  }
}

// Convert a Supabase user to our app's User format
export function convertToAppUser(supabaseUser: any): User {
  return {
    id: parseInt(supabaseUser.id.substring(0, 8), 16) % 1000000, 
    username: supabaseUser.user_metadata.username || supabaseUser.email?.split('@')[0] || '',
    email: supabaseUser.email || '',
    password: ''
  };
}