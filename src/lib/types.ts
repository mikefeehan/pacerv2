// PACER Data Types

export type ToneType = 'cheerful' | 'fired_up' | 'angry' | 'harsh_coach' | 'calm';
export type VoiceMode = 'real_only' | 'ai_only' | 'mix';
export type IntensityLevel = 'low' | 'medium' | 'high';
export type TriggerType = 'pace_drop' | 'late_run' | 'stall';
export type VoiceType = 'real' | 'ai';
export type PacerStatus = 'invited' | 'accepted' | 'blocked' | 'ready' | 'needs_setup';

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
  toneTag?: ToneType;
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
  memoId?: string;
  generatedText?: string;
  trackId?: string;
  trackName?: string;
  artistName?: string;
}

export interface RunSession {
  id: string;
  runnerUserId: string;
  pacerUserId: string;
  pacerName: string;
  voiceMode: VoiceMode;
  tone: ToneType;
  intensity: IntensityLevel;
  musicEnabled: boolean;
  startTime: string;
  endTime?: string;
  hypeEvents: HypeEvent[];
  recapTracks: { trackId: string; trackName: string; artistName: string }[];
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
