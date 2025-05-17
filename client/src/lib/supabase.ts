import { createClient } from "@supabase/supabase-js";

// Supabase client for database operations
const supabaseUrl = "https://zjetfdzgvnhdphchgjt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZXRmZHpndm5oZHBoY2hnanQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMzYwMDEzMSwiZXhwIjoyMDE5MTc2MTMxfQ.b65FRjhPT68AGiw9KPeJpgPRkwL3XVmvPDi5QXtUFj8";

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
