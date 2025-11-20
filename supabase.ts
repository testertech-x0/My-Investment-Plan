
import { createClient } from '@supabase/supabase-js';

// Safely access environment variables to prevent crashes if import.meta.env is undefined
const env = (import.meta as any).env || {};

// In Vite, env variables must start with VITE_
// We use the provided credentials as default fallbacks so the app works immediately.
// For production security, you should still set these in Vercel Environment Variables.
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hvnqbfuvgdzllsscqvps.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bnFiZnV2Z2R6bGxzc2NxdnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDY1MzEsImV4cCI6MjA3OTIyMjUzMX0.XGdaRQLFL079oloWka7WgcwjL1hbkJXwG6IyGqxCff8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
