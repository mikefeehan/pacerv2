// Database types for Supabase
// These match what you'll set up in Supabase when ready

export interface VoiceMemoRecord {
  id: string;
  pacer_user_id: string;
  pacer_name: string;
  storage_url: string;
  duration: number;
  vibe_tag: string | null;
  is_bonus: boolean;
  name: string;
  created_at: string;
}

export interface PacerProfileRecord {
  id: string;
  user_id: string;
  display_name: string;
  primary_pacer_type: string;
  ai_voice_enabled: boolean;
  spotify_connected: boolean;
  created_at: string;
  updated_at: string;
}

// SQL to create these tables in Supabase:
/*
-- Voice memos table
CREATE TABLE voice_memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pacer_user_id TEXT NOT NULL,
  pacer_name TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  vibe_tag TEXT,
  is_bonus BOOLEAN DEFAULT false,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster pacer lookups
CREATE INDEX idx_voice_memos_pacer ON voice_memos(pacer_user_id);

-- Storage bucket for audio files
-- Go to Storage in Supabase dashboard and create a bucket called "voice-memos"
-- Set it to public or create appropriate RLS policies
*/
