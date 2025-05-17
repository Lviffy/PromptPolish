import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zjetfdzgvnhdphchgjt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZXRmZHpndm5oZHBoY2hnanQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMzYwMDEzMSwiZXhwIjoyMDE5MTc2MTMxfQ.b65FRjhPT68AGiw9KPeJpgPRkwL3XVmvPDi5QXtUFj8";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Authentication helpers
export async function signUp(email: string, password: string, username: string) {
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
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}
