import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SITEOPS_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  '';

const supabaseKey = 
  process.env.NEXT_PUBLIC_SITEOPS_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export function isTrustedAssetUrl(value: string): boolean {
  if (!value || !isSupabaseConfigured) return false;
  try {
    const candidate = new URL(value);
    const project = new URL(supabaseUrl);
    return candidate.protocol === 'https:'
      && candidate.origin === project.origin
      && candidate.pathname.startsWith('/storage/v1/object/');
  } catch {
    return false;
  }
}

