import { createClient } from "@supabase/supabase-js";

// Log the entire import.meta.env object to see what's available
console.log("Vite import.meta.env:", import.meta.env);

// Supabase client for database operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not defined. Please check your .env file.");
}

if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not defined. Please check your .env file.");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// This file provides functions to work with our application's database
// We're using Supabase as our database provider

// Get a list of prompts for a user
export async function getPromptsForUser(userId: number) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

// Get favorited prompts for a user
export async function getFavoritePromptsForUser(userId: number) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

// Save a new prompt
export async function savePrompt(promptData: any) {
  const { data, error } = await supabase
    .from('prompts')
    .insert([promptData])
    .select();
    
  if (error) throw error;
  return data?.[0];
}

// Update a prompt's favorite status
export async function toggleFavorite(promptId: number, isFavorite: boolean) {
  const { data, error } = await supabase
    .from('prompts')
    .update({ is_favorite: isFavorite })
    .eq('id', promptId)
    .select();
    
  if (error) throw error;
  return data?.[0];
}
