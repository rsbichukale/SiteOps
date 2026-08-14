import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://olrctysejzdcxnntfivt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmN0eXNlanpkY3hubnRmaXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MDE1MDgsImV4cCI6MjEwMjA3NzUwOH0.VJ0wtlxGWyTCvX2XgjJFTKfpytKA2BG6puuQuTrfVCw';

const supabaseUrl = process.env.NEXT_PUBLIC_SITEOPS_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SITEOPS_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

