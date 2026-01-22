import { create } from 'zustand';
import type { RunSession, RunStats, HypeEvent, TriggerType } from './types';
import type { GPSPoint } from './gps-tracking';

// Active Run Store (ephemeral) - MULTI-PACER SUPPORT + GPS TRACKING
interface ActiveRunState {
  session: RunSession | null;
  stats: RunStats;
  isSimulating: boolean;
  lastHypeEventTime: number | null;
  hypeEventCount: number;
  usedMemoIds: Set<string>;
  usedTrackIds: Set<string>;
  // Track which pacer spoke last for rotation
  lastPacerIndex: number;
  // GPS tracking
  gpsPoints: GPSPoint[];
  isTrackingGPS: boolean;

  // Actions
  startRun: (session: Omit<RunSession, 'id' | 'startTime' | 'hypeEvents' | 'recapTracks'>) => void;
  endRun: () => RunSession | null;
  updateStats: (stats: Partial<RunStats>) => void;
  addHypeEvent: (event: Omit<HypeEvent, 'id'>) => void;
  setIsSimulating: (simulating: boolean) => void;
  markMemoUsed: (memoId: string) => void;
  markTrackUsed: (trackId: string) => void;
  getNextPacerIndex: () => number;
  resetRun: () => void;
  // GPS actions
  addGPSPoint: (point: GPSPoint) => void;
  setIsTrackingGPS: (tracking: boolean) => void;
  getGPSPoints: () => GPSPoint[];
}

const initialStats: RunStats = {
  elapsedTime: 0,
  distance: 0,
  currentPace: 0,
  rollingPace: 0,
  isRunning: false,
};

export const useActiveRunStore = create<ActiveRunState>((set, get) => ({
  session: null,
  stats: initialStats,
  isSimulating: false,
  lastHypeEventTime: null,
  hypeEventCount: 0,
  usedMemoIds: new Set(),
  usedTrackIds: new Set(),
  lastPacerIndex: -1,
  gpsPoints: [],
  isTrackingGPS: false,

  startRun: (sessionData) => {
    const session: RunSession = {
      ...sessionData,
      id: `run_${Date.now()}`,
      startTime: new Date().toISOString(),
      hypeEvents: [],
      recapTracks: [],
    };
    set({
      session,
      stats: { ...initialStats, isRunning: true },
      lastHypeEventTime: null,
      hypeEventCount: 0,
      usedMemoIds: new Set(),
      usedTrackIds: new Set(),
      lastPacerIndex: -1,
      gpsPoints: [],
      isTrackingGPS: false,
    });
  },

  endRun: () => {
    const state = get();
    if (!state.session) return null;

    const completedSession: RunSession = {
      ...state.session,
      endTime: new Date().toISOString(),
      totalDistance: state.stats.distance,
      totalDuration: Math.floor(state.stats.elapsedTime / 60),
    };

    set({
      session: completedSession,
      stats: { ...state.stats, isRunning: false },
      isSimulating: false,
    });

    return completedSession;
  },

  updateStats: (newStats) => set((state) => ({
    stats: { ...state.stats, ...newStats },
  })),

  addHypeEvent: (eventData) => {
    const state = get();
    const event: HypeEvent = {
      ...eventData,
      id: `hype_${Date.now()}`,
    };

    // Add to recap tracks if track info is present (max 3)
    const recapTracks = [...(state.session?.recapTracks || [])];
    if (eventData.trackId && eventData.trackName && eventData.artistName) {
      if (recapTracks.length < 3 && !recapTracks.find(t => t.trackId === eventData.trackId)) {
        recapTracks.push({
          trackId: eventData.trackId,
          trackName: eventData.trackName,
          artistName: eventData.artistName,
          pacerName: eventData.pacerName,
        });
      }
    }

    set((state) => ({
      session: state.session ? {
        ...state.session,
        hypeEvents: [...state.session.hypeEvents, event],
        recapTracks,
      } : null,
      lastHypeEventTime: Date.now(),
      hypeEventCount: state.hypeEventCount + 1,
    }));
  },

  setIsSimulating: (simulating) => set({ isSimulating: simulating }),

  markMemoUsed: (memoId) => set((state) => {
    const newSet = new Set(state.usedMemoIds);
    newSet.add(memoId);
    return { usedMemoIds: newSet };
  }),

  markTrackUsed: (trackId) => set((state) => {
    const newSet = new Set(state.usedTrackIds);
    newSet.add(trackId);
    return { usedTrackIds: newSet };
  }),

  // Rotate through pacers evenly
  getNextPacerIndex: () => {
    const state = get();
    const pacerCount = state.session?.pacerUserIds.length || 1;
    const nextIndex = (state.lastPacerIndex + 1) % pacerCount;
    set({ lastPacerIndex: nextIndex });
    return nextIndex;
  },

  resetRun: () => set({
    session: null,
    stats: initialStats,
    isSimulating: false,
    lastHypeEventTime: null,
    hypeEventCount: 0,
    usedMemoIds: new Set(),
    usedTrackIds: new Set(),
    lastPacerIndex: -1,
    gpsPoints: [],
    isTrackingGPS: false,
  }),

  // GPS tracking actions
  addGPSPoint: (point) => set((state) => ({
    gpsPoints: [...state.gpsPoints, point],
  })),

  setIsTrackingGPS: (tracking) => set({ isTrackingGPS: tracking }),

  getGPSPoints: () => get().gpsPoints,
}));

// Struggle Detection Logic
export const STRUGGLE_CONFIG = {
  // Don't trigger before this time/distance
  MIN_TIME_SECONDS: 360, // 6 minutes
  MIN_DISTANCE_MILES: 0.75,

  // Pace drop trigger
  PACE_DROP_THRESHOLD: 0.07, // 7% slower
  PACE_DROP_DURATION_SECONDS: 60,

  // Late run trigger (final 15-20% of run)
  LATE_RUN_PERCENTAGE: 0.15,

  // Stall trigger
  STALL_PACE_THRESHOLD: 0.15, // 15% slower
  STALL_DURATION_SECONDS: 90,
  STALL_MIN_DISTANCE: 2, // After mile 2

  // Cooldown between hype events - 180 seconds fixed
  COOLDOWN_SECONDS: 180,

  // Max events per run
  MAX_EVENTS: 6,
};

export function checkForStruggle(
  stats: RunStats,
  baselinePace: number,
  lastHypeTime: number | null,
  hypeCount: number,
  estimatedTotalDuration?: number
): TriggerType | null {
  const now = Date.now();
  const cooldownMs = STRUGGLE_CONFIG.COOLDOWN_SECONDS * 1000;

  // Check if on cooldown
  if (lastHypeTime && now - lastHypeTime < cooldownMs) {
    return null;
  }

  // Check if max events reached
  if (hypeCount >= STRUGGLE_CONFIG.MAX_EVENTS) {
    return null;
  }

  // Check minimum thresholds
  if (
    stats.elapsedTime < STRUGGLE_CONFIG.MIN_TIME_SECONDS ||
    stats.distance < STRUGGLE_CONFIG.MIN_DISTANCE_MILES
  ) {
    return null;
  }

  // Late run trigger
  if (estimatedTotalDuration && stats.elapsedTime > 0) {
    const progressRatio = stats.elapsedTime / estimatedTotalDuration;
    if (progressRatio >= (1 - STRUGGLE_CONFIG.LATE_RUN_PERCENTAGE)) {
      return 'late_run';
    }
  }

  // Pace drop trigger
  if (baselinePace > 0 && stats.rollingPace > 0) {
    const paceIncrease = (stats.rollingPace - baselinePace) / baselinePace;
    if (paceIncrease >= STRUGGLE_CONFIG.PACE_DROP_THRESHOLD) {
      return 'pace_drop';
    }
  }

  // Stall trigger (after mile 2)
  if (stats.distance >= STRUGGLE_CONFIG.STALL_MIN_DISTANCE && baselinePace > 0) {
    const paceIncrease = (stats.rollingPace - baselinePace) / baselinePace;
    if (paceIncrease >= STRUGGLE_CONFIG.STALL_PACE_THRESHOLD) {
      return 'stall';
    }
  }

  return null;
}
