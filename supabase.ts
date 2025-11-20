
import { createClient } from '@supabase/supabase-js';

// Safely access environment variables to prevent crashes if import.meta.env is undefined
const env = (import.meta as any).env || {};

// In Vite, env variables must start with VITE_
// We use the provided credentials as default fallbacks so the app works immediately.
// For production security, you should still set these in Vercel Environment Variables.
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://mnirgjfewemcibqahngk.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uaXJnamZld2VtY2licWFobmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDc1NDYsImV4cCI6MjA3OTIyMzU0Nn0._Awce45gI8u9ylQXx4MEeHcHRFPcXVi6_HI5_bdz_m8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
