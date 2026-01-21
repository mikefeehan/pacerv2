// PACER Haptics Service
// Provides vibe-specific haptic patterns during hype moments

import * as Haptics from 'expo-haptics';
import type { VibeType, IntensityLevel } from './types';

// Haptic device modes
export type HapticDeviceMode = 'off' | 'iphone_only' | 'watch_only' | 'iphone_watch';

// Haptic settings interface
export interface HapticSettings {
  enabled: boolean;
  deviceMode: HapticDeviceMode;
  intensity: IntensityLevel;
  beatPushEnabled: boolean;
}

// Default haptic settings
export const DEFAULT_HAPTIC_SETTINGS: HapticSettings = {
  enabled: true,
  deviceMode: 'iphone_only',
  intensity: 'medium',
  beatPushEnabled: false,
};

// Intensity multipliers
const INTENSITY_MULTIPLIERS: Record<IntensityLevel, { amplitude: number; pulseMultiplier: number; durationMultiplier: number }> = {
  low: { amplitude: 0.6, pulseMultiplier: 0.7, durationMultiplier: 0.8 },
  medium: { amplitude: 1.0, pulseMultiplier: 1.0, durationMultiplier: 1.0 },
  high: { amplitude: 1.2, pulseMultiplier: 1.3, durationMultiplier: 1.2 },
};

// Vibe-specific haptic pattern configurations
interface HapticPattern {
  type: 'tap' | 'double_tap' | 'pulse' | 'buzz';
  intervalMs: number; // Time between pulses
  durationMs: number; // Total pattern duration
  style: Haptics.ImpactFeedbackStyle;
}

const VIBE_HAPTIC_PATTERNS: Record<VibeType, HapticPattern> = {
  // Cheerful: light single taps every 600–800ms for 2–4s
  cheerful: {
    type: 'tap',
    intervalMs: 700,
    durationMs: 3000,
    style: Haptics.ImpactFeedbackStyle.Light,
  },
  // Fired Up: medium-fast pulses every 250–350ms for 3–6s
  fired_up: {
    type: 'pulse',
    intervalMs: 300,
    durationMs: 4500,
    style: Haptics.ImpactFeedbackStyle.Medium,
  },
  // Angry: sharp double-tap (tap-tap) every 700–900ms for 3–5s
  angry: {
    type: 'double_tap',
    intervalMs: 800,
    durationMs: 4000,
    style: Haptics.ImpactFeedbackStyle.Heavy,
  },
  // Harsh Coach: strong sustained buzz 1.5–2.5s + 2–3 sharp hits, total 3–6s
  harsh_coach: {
    type: 'buzz',
    intervalMs: 500,
    durationMs: 4500,
    style: Haptics.ImpactFeedbackStyle.Heavy,
  },
  // Calm: slow steady pulse every 900–1200ms for 3–6s
  calm: {
    type: 'pulse',
    intervalMs: 1050,
    durationMs: 4500,
    style: Haptics.ImpactFeedbackStyle.Light,
  },
};

// Beat push BPM buckets (approximate, no real beat detection)
const BEAT_PUSH_BPM_BUCKETS = [100, 120, 140, 160];

// Active haptic sequence controller
let activeHapticInterval: ReturnType<typeof setInterval> | null = null;
let activeBeatPushInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Stop any active haptic sequences
 */
export function stopHaptics(): void {
  if (activeHapticInterval) {
    clearInterval(activeHapticInterval);
    activeHapticInterval = null;
  }
  if (activeBeatPushInterval) {
    clearInterval(activeBeatPushInterval);
    activeBeatPushInterval = null;
  }
}

/**
 * Execute a single tap haptic
 */
async function doTap(style: Haptics.ImpactFeedbackStyle): Promise<void> {
  await Haptics.impactAsync(style);
}

/**
 * Execute a double tap haptic (tap-tap pattern)
 */
async function doDoubleTap(style: Haptics.ImpactFeedbackStyle): Promise<void> {
  await Haptics.impactAsync(style);
  await new Promise(resolve => setTimeout(resolve, 80));
  await Haptics.impactAsync(style);
}

/**
 * Execute a sustained buzz effect (multiple rapid haptics)
 */
async function doBuzz(style: Haptics.ImpactFeedbackStyle, durationMs: number): Promise<void> {
  const buzzInterval = 50; // Rapid pulses
  const buzzCount = Math.floor(durationMs / buzzInterval);

  for (let i = 0; i < buzzCount; i++) {
    await Haptics.impactAsync(style);
    await new Promise(resolve => setTimeout(resolve, buzzInterval));
  }
}

/**
 * Execute the main haptic pattern for a vibe
 */
export async function playVibeHapticPattern(
  vibe: VibeType,
  intensity: IntensityLevel,
  settings: HapticSettings
): Promise<void> {
  // Check if haptics are enabled
  if (!settings.enabled || settings.deviceMode === 'off' || settings.deviceMode === 'watch_only') {
    return;
  }

  // Stop any existing patterns
  stopHaptics();

  const pattern = VIBE_HAPTIC_PATTERNS[vibe];
  const intensityMod = INTENSITY_MULTIPLIERS[intensity];

  // Adjust duration based on intensity (cap at 6s)
  const adjustedDuration = Math.min(pattern.durationMs * intensityMod.durationMultiplier, 6000);
  const adjustedInterval = pattern.intervalMs / intensityMod.pulseMultiplier;

  const startTime = Date.now();

  // For harsh_coach, start with a sustained buzz
  if (vibe === 'harsh_coach') {
    // Initial sustained buzz for 2 seconds
    const buzzDuration = 2000 * intensityMod.durationMultiplier;
    await doBuzz(pattern.style, Math.min(buzzDuration, 2500));

    // Then follow with 2-3 sharp hits
    const sharpHitCount = intensity === 'high' ? 3 : 2;
    for (let i = 0; i < sharpHitCount; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    return;
  }

  // For other patterns, run interval-based haptics
  const executePattern = async () => {
    if (Date.now() - startTime >= adjustedDuration) {
      stopHaptics();
      return;
    }

    switch (pattern.type) {
      case 'tap':
      case 'pulse':
        await doTap(pattern.style);
        break;
      case 'double_tap':
        await doDoubleTap(pattern.style);
        break;
    }
  };

  // Execute first haptic immediately
  await executePattern();

  // Set up interval for remaining haptics
  activeHapticInterval = setInterval(async () => {
    if (Date.now() - startTime >= adjustedDuration) {
      stopHaptics();
      return;
    }
    await executePattern();
  }, adjustedInterval);
}

/**
 * Play beat push haptics (tempo-like rhythm after hype moment)
 */
export async function playBeatPush(
  intensity: IntensityLevel,
  settings: HapticSettings,
  durationMs: number = 6000
): Promise<void> {
  if (!settings.enabled || !settings.beatPushEnabled || settings.deviceMode === 'off' || settings.deviceMode === 'watch_only') {
    return;
  }

  // Stop any existing beat push
  if (activeBeatPushInterval) {
    clearInterval(activeBeatPushInterval);
  }

  const intensityMod = INTENSITY_MULTIPLIERS[intensity];

  // Pick a random BPM bucket
  const bpm = BEAT_PUSH_BPM_BUCKETS[Math.floor(Math.random() * BEAT_PUSH_BPM_BUCKETS.length)];
  const intervalMs = (60 / bpm) * 1000; // Convert BPM to interval

  const startTime = Date.now();
  const adjustedDuration = Math.min(durationMs * intensityMod.durationMultiplier, 8000);

  activeBeatPushInterval = setInterval(async () => {
    if (Date.now() - startTime >= adjustedDuration) {
      if (activeBeatPushInterval) {
        clearInterval(activeBeatPushInterval);
        activeBeatPushInterval = null;
      }
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, intervalMs);
}

/**
 * Main function to trigger haptics for a hype event
 * Called 0.2s before voice plays
 */
export async function triggerHypeHaptics(
  vibe: VibeType,
  settings: HapticSettings
): Promise<void> {
  if (!settings.enabled || settings.deviceMode === 'off') {
    return;
  }

  // Play the vibe-specific pattern
  await playVibeHapticPattern(vibe, settings.intensity, settings);

  // If beat push is enabled, start it after a delay (1-2 seconds after voice would end)
  if (settings.beatPushEnabled) {
    // Voice typically 2-6 seconds, plus 1-2 second delay
    const delayMs = VIBE_HAPTIC_PATTERNS[vibe].durationMs + 1500;
    setTimeout(() => {
      playBeatPush(settings.intensity, settings, 6000);
    }, delayMs);
  }
}

/**
 * Get haptic pattern description for UI
 */
export function getHapticPatternDescription(vibe: VibeType): string {
  const descriptions: Record<VibeType, string> = {
    cheerful: 'Light taps',
    fired_up: 'Fast pulses',
    angry: 'Sharp double-taps',
    harsh_coach: 'Strong buzz + hits',
    calm: 'Slow steady pulses',
  };
  return descriptions[vibe];
}
