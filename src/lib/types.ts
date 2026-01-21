// PACER Data Types

// Vibe = the energy/tone for the entire run
export type VibeType = 'cheerful' | 'fired_up' | 'angry' | 'harsh_coach' | 'calm';
export type VoiceMode = 'real_only' | 'ai_only' | 'mix';
export type IntensityLevel = 'low' | 'medium' | 'high';
export type TriggerType = 'pace_drop' | 'late_run' | 'stall';
export type VoiceType = 'real' | 'ai';
export type PacerStatus = 'invited' | 'accepted' | 'blocked' | 'ready' | 'needs_setup';

// Vibe configuration with descriptions
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
  vibeTag?: VibeType; // Which vibe this memo is for
  duration: number; // seconds
  name?: string;
  createdAt: string;
}

export interface PacerProfile {
  pacerUserId: string;
  voiceMemos: VoiceMemo[];
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
