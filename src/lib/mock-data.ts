import type {
  PacerRelationship,
  VoiceMemo,
  ToneType,
  TriggerType
} from './types';

// Mock Pacers
export const MOCK_PACERS: PacerRelationship[] = [
  {
    runnerUserId: 'user_1',
    pacerUserId: 'pacer_ashley',
    pacerName: 'Ashley',
    pacerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    status: 'ready',
    voiceReady: true,
    musicReady: true,
  },
  {
    runnerUserId: 'user_1',
    pacerUserId: 'pacer_kevin',
    pacerName: 'Kevin',
    pacerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    status: 'ready',
    voiceReady: true,
    musicReady: true,
  },
  {
    runnerUserId: 'user_1',
    pacerUserId: 'pacer_me',
    pacerName: 'Me',
    pacerAvatar: undefined,
    status: 'needs_setup',
    voiceReady: false,
    musicReady: false,
  },
];

// Mock Voice Memos for Ashley
export const MOCK_VOICE_MEMOS_ASHLEY: VoiceMemo[] = [
  { id: 'memo_1', url: '', toneTag: 'cheerful', duration: 8, name: 'You got this!', createdAt: '2024-01-01' },
  { id: 'memo_2', url: '', toneTag: 'fired_up', duration: 10, name: 'Push through!', createdAt: '2024-01-01' },
  { id: 'memo_3', url: '', toneTag: 'calm', duration: 12, name: 'Steady pace', createdAt: '2024-01-01' },
  { id: 'memo_4', url: '', toneTag: 'harsh_coach', duration: 7, name: 'No excuses', createdAt: '2024-01-01' },
  { id: 'memo_5', url: '', toneTag: 'angry', duration: 9, name: 'Prove it', createdAt: '2024-01-01' },
  { id: 'memo_6', url: '', toneTag: 'fired_up', duration: 11, name: 'Final push', createdAt: '2024-01-01' },
];

// Mock Spotify Tracks
export const MOCK_TRACKS = {
  warmup: [
    { trackId: 'track_1', trackName: 'Blinding Lights', artistName: 'The Weeknd' },
    { trackId: 'track_2', trackName: 'Levitating', artistName: 'Dua Lipa' },
  ],
  grind: [
    { trackId: 'track_3', trackName: 'Lose Yourself', artistName: 'Eminem' },
    { trackId: 'track_4', trackName: 'Till I Collapse', artistName: 'Eminem' },
    { trackId: 'track_5', trackName: 'Stronger', artistName: 'Kanye West' },
    { trackId: 'track_6', trackName: 'Eye of the Tiger', artistName: 'Survivor' },
  ],
  finish: [
    { trackId: 'track_7', trackName: "Can't Hold Us", artistName: 'Macklemore' },
    { trackId: 'track_8', trackName: 'Unstoppable', artistName: 'Sia' },
  ],
};

// AI-generated voice lines by tone
export const AI_VOICE_LINES: Record<ToneType, string[]> = {
  cheerful: [
    "You're doing amazing! Keep that smile going!",
    "Look at you crushing it! So proud of you!",
    "Every step is progress. You're incredible!",
    "This is YOUR moment. Enjoy every stride!",
  ],
  fired_up: [
    "LET'S GO! This is what you trained for!",
    "No stopping now! You're a MACHINE!",
    "Feel that fire? That's your power!",
    "THIS is the moment! PUSH IT!",
  ],
  angry: [
    "You think this is hard? PROVE you're tougher!",
    "Pain is temporary. Don't you DARE stop!",
    "You wanted this. Now EARN it!",
    "Show me what you're made of!",
  ],
  harsh_coach: [
    "Dig deeper. You have more in the tank.",
    "Excuses won't finish this run. You will.",
    "This is where champions are made. Move.",
    "Your legs aren't tired. Your mind is. Override it.",
  ],
  calm: [
    "Breathe. You've got this. One step at a time.",
    "Stay steady. Trust your training.",
    "Find your rhythm. You're right where you need to be.",
    "Relax your shoulders. You're doing great.",
  ],
};

// Demo Run Simulation Data
export interface DemoRunPoint {
  timeSeconds: number;
  distanceMiles: number;
  paceMinPerMile: number;
  trigger?: TriggerType;
}

// 25-minute demo run with 4 struggle moments
export const DEMO_RUN_POINTS: DemoRunPoint[] = [
  // Warmup phase (0-6 min)
  { timeSeconds: 0, distanceMiles: 0, paceMinPerMile: 10.0 },
  { timeSeconds: 60, distanceMiles: 0.1, paceMinPerMile: 10.0 },
  { timeSeconds: 120, distanceMiles: 0.2, paceMinPerMile: 9.8 },
  { timeSeconds: 180, distanceMiles: 0.32, paceMinPerMile: 9.4 },
  { timeSeconds: 240, distanceMiles: 0.44, paceMinPerMile: 9.2 },
  { timeSeconds: 300, distanceMiles: 0.56, paceMinPerMile: 9.0 },
  { timeSeconds: 360, distanceMiles: 0.7, paceMinPerMile: 8.8 },

  // Grind phase starts (6-20 min)
  { timeSeconds: 420, distanceMiles: 0.85, paceMinPerMile: 8.6 },
  { timeSeconds: 480, distanceMiles: 1.0, paceMinPerMile: 8.5 },

  // First struggle - pace drop at ~9 min
  { timeSeconds: 540, distanceMiles: 1.12, paceMinPerMile: 9.2, trigger: 'pace_drop' },

  { timeSeconds: 600, distanceMiles: 1.23, paceMinPerMile: 8.7 },
  { timeSeconds: 720, distanceMiles: 1.48, paceMinPerMile: 8.5 },
  { timeSeconds: 840, distanceMiles: 1.73, paceMinPerMile: 8.5 },

  // Second struggle - stall around mile 2
  { timeSeconds: 960, distanceMiles: 2.0, paceMinPerMile: 9.8, trigger: 'stall' },

  { timeSeconds: 1020, distanceMiles: 2.1, paceMinPerMile: 8.8 },
  { timeSeconds: 1140, distanceMiles: 2.35, paceMinPerMile: 8.6 },

  // Third struggle - pace drop at ~15 min
  { timeSeconds: 1200, distanceMiles: 2.45, paceMinPerMile: 9.5, trigger: 'pace_drop' },

  { timeSeconds: 1260, distanceMiles: 2.55, paceMinPerMile: 8.7 },
  { timeSeconds: 1380, distanceMiles: 2.8, paceMinPerMile: 8.5 },

  // Late run phase (final 20%)
  { timeSeconds: 1440, distanceMiles: 2.95, paceMinPerMile: 8.8, trigger: 'late_run' },

  { timeSeconds: 1500, distanceMiles: 3.1, paceMinPerMile: 8.4 },
];

// Helper to get random item from array
export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get AI voice line for current situation
export function getAIVoiceLine(tone: ToneType, trigger: TriggerType, usedLines: Set<string>): string {
  const lines = AI_VOICE_LINES[tone];
  const unusedLines = lines.filter(l => !usedLines.has(l));
  const pool = unusedLines.length > 0 ? unusedLines : lines;
  return getRandomItem(pool);
}

// Get track for current phase
export function getTrackForPhase(
  elapsedSeconds: number,
  totalEstimatedSeconds: number,
  usedTracks: Set<string>
): { trackId: string; trackName: string; artistName: string } {
  const progress = elapsedSeconds / totalEstimatedSeconds;

  let bucket: typeof MOCK_TRACKS.warmup;
  if (progress < 0.2) {
    bucket = MOCK_TRACKS.warmup;
  } else if (progress < 0.8) {
    bucket = MOCK_TRACKS.grind;
  } else {
    bucket = MOCK_TRACKS.finish;
  }

  const unusedTracks = bucket.filter(t => !usedTracks.has(t.trackId));
  const pool = unusedTracks.length > 0 ? unusedTracks : bucket;
  return getRandomItem(pool);
}
