// PACER Data Types

// Pacer Type = the core identity a Pacer chooses (required, single selection)
export type PacerType = 'cheerful' | 'fired_up' | 'harsh_coach' | 'calm';

// Vibe = the energy/tone for the entire run (can be any type, runner's choice)
export type VibeType = 'cheerful' | 'fired_up' | 'angry' | 'harsh_coach' | 'calm';
export type VoiceMode = 'real_only' | 'ai_only' | 'mix';
export type IntensityLevel = 'low' | 'medium' | 'high';
export type TriggerType = 'pace_drop' | 'late_run' | 'stall';
export type VoiceType = 'real' | 'ai';
export type PacerStatus = 'invited' | 'accepted' | 'blocked' | 'ready' | 'needs_setup';

// Pacer Type configuration (for onboarding identity selection)
export interface PacerTypeConfig {
  type: PacerType;
  label: string;
  emoji: string;
  description: string;
  examplePhrases: string[];
}

export const PACER_TYPES: PacerTypeConfig[] = [
  {
    type: 'cheerful',
    label: 'Cheerful / Supportive',
    emoji: '😊',
    description: 'Positive, encouraging, keeps things light.',
    examplePhrases: ["You've got this.", "Nice work.", "Stay smooth."],
  },
  {
    type: 'fired_up',
    label: 'Fired Up',
    emoji: '🔥',
    description: 'High energy, motivating, hype-focused.',
    examplePhrases: ["Let's go.", "This is the moment.", "Push through."],
  },
  {
    type: 'harsh_coach',
    label: 'Harsh Coach',
    emoji: '🧱',
    description: 'No excuses, tough love, push through.',
    examplePhrases: ["Push mode.", "No slowing down now.", "Earn it."],
  },
  {
    type: 'calm',
    label: 'Calm / Steady',
    emoji: '😌',
    description: 'Grounded, focused, steady pace.',
    examplePhrases: ["Relax your shoulders.", "Steady pace.", "You're in control."],
  },
];

// Vibe configuration with descriptions (for runner vibe selection)
export interface VibeConfig {
  type: VibeType;
  label: string;
  emoji: string;
  description: string;
}

export const VIBES: VibeConfig[] = [
  { type: 'cheerful', label: 'Cheerful', emoji: '😊', description: 'Positive, upbeat, supportive' },
  { type: 'fired_up', label: 'Fired Up', emoji: '🔥', description: 'High energy, intense motivation' },
  { type: 'angry', label: 'Angry', emoji: '😤', description: 'Challenging, confrontational' },
  { type: 'harsh_coach', label: 'Harsh Coach', emoji: '🧱', description: 'No excuses, tough love' },
  { type: 'calm', label: 'Calm', emoji: '😌', description: 'Controlled, steady encouragement' },
];

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  stravaUserId?: string;
  stravaConnected: boolean;
  spotifyConnected: boolean;
  onboardingComplete: boolean;
}

export interface VoiceMemo {
  id: string;
  url: string;
  vibeTag?: VibeType; // Which vibe this memo is for (undefined = bonus memo)
  isBonus?: boolean; // True for bonus custom memos (not tied to vibe)
  duration: number; // seconds
  name?: string;
  createdAt: string;
}

export interface PacerProfile {
  pacerUserId: string;
  // Core identity (required)
  primaryPacerType: PacerType; // The Pacer's chosen identity
  // Voice content
  corePhrases: VoiceMemo[]; // 3+ required phrases matching primaryPacerType
  bonusMemos: VoiceMemo[]; // 0-2 optional personal memos
  additionalVibes: { // Optional additional vibe recordings
    vibe: VibeType;
    phrases: VoiceMemo[];
  }[];
  // Legacy field for backwards compatibility
  voiceMemos: VoiceMemo[];
  // Settings
  aiVoiceEnabled: boolean;
  spotifyConnected: boolean;
  spotifyProfileRef?: string;
}

export interface PacerRelationship {
  runnerUserId: string;
  pacerUserId: string;
  status: PacerStatus;
  pacerName: string;
  pacerAvatar?: string;
  voiceReady: boolean;
  musicReady: boolean;
}

export interface HypeEvent {
  id: string;
  timestamp: string;
  triggerType: TriggerType;
  voiceType: VoiceType;
  pacerUserId: string; // Which pacer spoke
  pacerName: string;
  memoId?: string;
  generatedText?: string;
  trackId?: string;
  trackName?: string;
  artistName?: string;
}

// Multi-pacer run session
export interface RunSession {
  id: string;
  runnerUserId: string;
  // Multi-pacer support
  pacerUserIds: string[];
  pacerNames: string[];
  voiceMode: VoiceMode;
  vibe: VibeType; // Single vibe for the entire run
  musicEnabled: boolean;
  startTime: string;
  endTime?: string;
  hypeEvents: HypeEvent[];
  recapTracks: { trackId: string; trackName: string; artistName: string; pacerName: string }[];
  stravaActivityId?: string;
  totalDistance?: number; // miles
  totalDuration?: number; // minutes
}

export interface RunStats {
  elapsedTime: number; // seconds
  distance: number; // miles
  currentPace: number; // minutes per mile
  rollingPace: number; // 1-min rolling average
  isRunning: boolean;
}

// Settings
export interface AppSettings {
  playbackMode: 'duck_voice' | 'queue_injection' | 'voice_only';
  duckAmount: 'low' | 'medium' | 'high';
  hypeFrequency: IntensityLevel;
  showStravaPostPreview: boolean;
}

// Public Pacer Types
export type PublicPacerCategory =
  | 'top_fired_up'
  | 'best_harsh_coach'
  | 'best_calm'
  | 'music_first'
  | 'celebrity_verified';

export interface PublicPacerCategoryConfig {
  id: PublicPacerCategory;
  title: string;
  subtitle: string;
  emoji: string;
}

export const PUBLIC_PACER_CATEGORIES: PublicPacerCategoryConfig[] = [
  { id: 'celebrity_verified', title: 'Celebrity & Verified', subtitle: 'Famous voices to pace you', emoji: '⭐' },
  { id: 'top_fired_up', title: 'Top Fired Up Pacers', subtitle: 'High energy motivation', emoji: '🔥' },
  { id: 'best_harsh_coach', title: 'Best Harsh Coach', subtitle: 'No excuses, tough love', emoji: '🧱' },
  { id: 'best_calm', title: 'Best Calm Pacers', subtitle: 'Perfect for long runs', emoji: '😌' },
  { id: 'music_first', title: 'Music-First Pacers', subtitle: 'Great playlists for runners', emoji: '🎵' },
];

export type MusicStyle = 'hip_hop' | 'edm' | 'pop' | 'rock' | 'indie' | 'r_and_b' | 'classical' | 'mixed';

export interface PublicPacer {
  id: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  // Profile info
  bio?: string;
  vibesOffered: VibeType[];
  musicStyles: MusicStyle[];
  bestUseCase: string; // e.g., "Best for final mile pushes"
  // Aggregate stats only (privacy)
  totalRunsPaced: number;
  paceRecoveryScore: number; // 0-100, effectiveness metric
  // Settings
  aiVoiceEnabled: boolean;
  // Categories this pacer appears in
  categories: PublicPacerCategory[];
}

export const MUSIC_STYLE_LABELS: Record<MusicStyle, string> = {
  hip_hop: 'Hip Hop',
  edm: 'EDM',
  pop: 'Pop',
  rock: 'Rock',
  indie: 'Indie',
  r_and_b: 'R&B',
  classical: 'Classical',
  mixed: 'Mixed',
};
