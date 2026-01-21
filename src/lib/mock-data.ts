import type {
  PacerRelationship,
  VoiceMemo,
  VibeType,
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
    pacerUserId: 'pacer_nick',
    pacerName: 'Nick',
    pacerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
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

// Mock Voice Memos by Pacer and Vibe
export interface PacerVoiceMemos {
  pacerUserId: string;
  pacerName: string;
  memos: VoiceMemo[];
}

export const MOCK_PACER_MEMOS: Record<string, PacerVoiceMemos> = {
  pacer_ashley: {
    pacerUserId: 'pacer_ashley',
    pacerName: 'Ashley',
    memos: [
      { id: 'ashley_1', url: '', vibeTag: 'cheerful', duration: 5, name: "Let's go, you got this!", createdAt: '2024-01-01' },
      { id: 'ashley_2', url: '', vibeTag: 'cheerful', duration: 6, name: "You're crushing it!", createdAt: '2024-01-01' },
      { id: 'ashley_3', url: '', vibeTag: 'cheerful', duration: 4, name: "Turn it up!", createdAt: '2024-01-01' },
      { id: 'ashley_4', url: '', vibeTag: 'fired_up', duration: 7, name: "THIS is your moment!", createdAt: '2024-01-01' },
      { id: 'ashley_5', url: '', vibeTag: 'fired_up', duration: 5, name: "No stopping now!", createdAt: '2024-01-01' },
      { id: 'ashley_6', url: '', vibeTag: 'harsh_coach', duration: 6, name: "Push mode. No excuses.", createdAt: '2024-01-01' },
      { id: 'ashley_7', url: '', vibeTag: 'harsh_coach', duration: 8, name: "No slowing down now, c'mon!", createdAt: '2024-01-01' },
      { id: 'ashley_8', url: '', vibeTag: 'calm', duration: 7, name: "Breathe. One step at a time.", createdAt: '2024-01-01' },
    ],
  },
  pacer_kevin: {
    pacerUserId: 'pacer_kevin',
    pacerName: 'Kevin',
    memos: [
      { id: 'kevin_1', url: '', vibeTag: 'fired_up', duration: 6, name: "LETS GOOO! You're a machine!", createdAt: '2024-01-01' },
      { id: 'kevin_2', url: '', vibeTag: 'fired_up', duration: 5, name: "Feel that fire? Use it!", createdAt: '2024-01-01' },
      { id: 'kevin_3', url: '', vibeTag: 'fired_up', duration: 7, name: "You trained for this!", createdAt: '2024-01-01' },
      { id: 'kevin_4', url: '', vibeTag: 'angry', duration: 6, name: "You think this is hard? PROVE IT!", createdAt: '2024-01-01' },
      { id: 'kevin_5', url: '', vibeTag: 'angry', duration: 5, name: "Pain is temporary. MOVE!", createdAt: '2024-01-01' },
      { id: 'kevin_6', url: '', vibeTag: 'harsh_coach', duration: 7, name: "Dig deeper. You have more.", createdAt: '2024-01-01' },
      { id: 'kevin_7', url: '', vibeTag: 'cheerful', duration: 5, name: "Looking strong out there!", createdAt: '2024-01-01' },
    ],
  },
  pacer_nick: {
    pacerUserId: 'pacer_nick',
    pacerName: 'Nick',
    memos: [
      { id: 'nick_1', url: '', vibeTag: 'calm', duration: 8, name: "Stay steady. Trust your training.", createdAt: '2024-01-01' },
      { id: 'nick_2', url: '', vibeTag: 'calm', duration: 6, name: "Find your rhythm.", createdAt: '2024-01-01' },
      { id: 'nick_3', url: '', vibeTag: 'calm', duration: 7, name: "Relax your shoulders. You're doing great.", createdAt: '2024-01-01' },
      { id: 'nick_4', url: '', vibeTag: 'cheerful', duration: 5, name: "Every step is progress!", createdAt: '2024-01-01' },
      { id: 'nick_5', url: '', vibeTag: 'harsh_coach', duration: 6, name: "This is where champions are made.", createdAt: '2024-01-01' },
      { id: 'nick_6', url: '', vibeTag: 'fired_up', duration: 5, name: "Finish line is waiting for you!", createdAt: '2024-01-01' },
    ],
  },
};

// Mock Spotify Tracks by Pacer
export const MOCK_PACER_TRACKS: Record<string, { trackId: string; trackName: string; artistName: string }[]> = {
  pacer_ashley: [
    { trackId: 'ashley_track_1', trackName: 'Blinding Lights', artistName: 'The Weeknd' },
    { trackId: 'ashley_track_2', trackName: 'Levitating', artistName: 'Dua Lipa' },
    { trackId: 'ashley_track_3', trackName: 'Dance Monkey', artistName: 'Tones and I' },
    { trackId: 'ashley_track_4', trackName: "Can't Stop The Feeling", artistName: 'Justin Timberlake' },
  ],
  pacer_kevin: [
    { trackId: 'kevin_track_1', trackName: 'Lose Yourself', artistName: 'Eminem' },
    { trackId: 'kevin_track_2', trackName: 'Till I Collapse', artistName: 'Eminem' },
    { trackId: 'kevin_track_3', trackName: 'Stronger', artistName: 'Kanye West' },
    { trackId: 'kevin_track_4', trackName: 'Power', artistName: 'Kanye West' },
  ],
  pacer_nick: [
    { trackId: 'nick_track_1', trackName: 'Eye of the Tiger', artistName: 'Survivor' },
    { trackId: 'nick_track_2', trackName: "Can't Hold Us", artistName: 'Macklemore' },
    { trackId: 'nick_track_3', trackName: 'Unstoppable', artistName: 'Sia' },
    { trackId: 'nick_track_4', trackName: 'Hall of Fame', artistName: 'The Script' },
  ],
};

// AI-generated voice lines by vibe
export const AI_VOICE_LINES: Record<VibeType, string[]> = {
  cheerful: [
    "You're doing amazing! Keep that smile going!",
    "Look at you crushing it! So proud of you!",
    "Every step is progress. You're incredible!",
    "This is YOUR moment. Enjoy every stride!",
    "You've got this! Keep shining!",
  ],
  fired_up: [
    "LET'S GO! This is what you trained for!",
    "No stopping now! You're a MACHINE!",
    "Feel that fire? That's your power!",
    "THIS is the moment! PUSH IT!",
    "You're UNSTOPPABLE right now!",
  ],
  angry: [
    "You think this is hard? PROVE you're tougher!",
    "Pain is temporary. Don't you DARE stop!",
    "You wanted this. Now EARN it!",
    "Show me what you're made of!",
    "Really, you don't want it? PROVE ME WRONG!",
  ],
  harsh_coach: [
    "Dig deeper. You have more in the tank.",
    "Excuses won't finish this run. You will.",
    "This is where champions are made. Move.",
    "Your legs aren't tired. Your mind is. Override it.",
    "No slowing down. That's not who you are.",
  ],
  calm: [
    "Breathe. You've got this. One step at a time.",
    "Stay steady. Trust your training.",
    "Find your rhythm. You're right where you need to be.",
    "Relax your shoulders. You're doing great.",
    "Keep that pace. Smooth and controlled.",
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

// Get AI voice line for current vibe
export function getAIVoiceLine(vibe: VibeType, usedLines: Set<string>): string {
  const lines = AI_VOICE_LINES[vibe];
  const unusedLines = lines.filter(l => !usedLines.has(l));
  const pool = unusedLines.length > 0 ? unusedLines : lines;
  return getRandomItem(pool);
}

// Get memo for a pacer matching the vibe
export function getMemoForPacer(
  pacerUserId: string,
  vibe: VibeType,
  usedMemoIds: Set<string>
): VoiceMemo | null {
  const pacerMemos = MOCK_PACER_MEMOS[pacerUserId];
  if (!pacerMemos) return null;

  // Filter by vibe and unused
  const matchingMemos = pacerMemos.memos.filter(
    m => m.vibeTag === vibe && !usedMemoIds.has(m.id)
  );

  if (matchingMemos.length > 0) {
    return getRandomItem(matchingMemos);
  }

  // Fallback to any unused memo for this pacer
  const anyUnused = pacerMemos.memos.filter(m => !usedMemoIds.has(m.id));
  if (anyUnused.length > 0) {
    return getRandomItem(anyUnused);
  }

  // Fallback to any memo
  return getRandomItem(pacerMemos.memos);
}

// Get track for a pacer
export function getTrackForPacer(
  pacerUserId: string,
  usedTrackIds: Set<string>
): { trackId: string; trackName: string; artistName: string } | null {
  const tracks = MOCK_PACER_TRACKS[pacerUserId];
  if (!tracks || tracks.length === 0) return null;

  const unusedTracks = tracks.filter(t => !usedTrackIds.has(t.trackId));
  const pool = unusedTracks.length > 0 ? unusedTracks : tracks;
  return getRandomItem(pool);
}
