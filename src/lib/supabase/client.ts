// Supabase client placeholder
// When you're ready to go live:
// 1. Go to the API tab in Vibecode
// 2. Set up Supabase integration
// 3. The client will be automatically configured

// These will be set via ENV tab in Vibecode when ready to go live
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Check if Supabase is configured and ready
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Get Supabase credentials (for use with fetch API)
 */
export function getSupabaseCredentials() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  };
}
