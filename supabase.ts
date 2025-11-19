
import { createClient } from '@supabase/supabase-js';

// Retrieve these from your Vercel Environment Variables or .env file
const env = (import.meta as any).env || {};

// Removed the accidental '$0' from the end of the URL
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://ydbwltqxxpdypbtngwzu.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYndsdHF4eHBkeXBidG5nd3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Nzg5OTcsImV4cCI6MjA3OTE1NDk5N30.GXTYkk1aTMsa6xLJin-bMTMX3vem6Bcwj_1xoDAo-R8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
