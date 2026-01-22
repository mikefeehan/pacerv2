import { formatPace } from './gps-tracking';

/**
 * Generate a personalized Strava activity title
 * Format: {distance} mi • {pace}/mi • w/ {pacer}
 */
export function generateStravaTitle(config: {
  distance: number;
  pace: number;
  pacers: string[];
}): string {
  const { distance, pace, pacers } = config;

  const distanceStr = distance.toFixed(2);
  const paceStr = formatPace(pace);
  const pacerStr = pacers.join(' + ');

  return `${distanceStr} mi • ${paceStr}/mi • w/ ${pacerStr}`;
}

/**
 * Generate a detailed Strava activity description
 * Includes recap of hype moments
 */
export function generateStravaDescription(config: {
  distance: number;
  duration: number;
  pace: number;
  hypeCount: number;
  pacers: string[];
  vibeEmoji: string;
}): string {
  const { distance, duration, pace, hypeCount, pacers, vibeEmoji } = config;

  const minutes = Math.floor(duration / 60);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  const paceStr = formatPace(pace);

  return `Pushed by ${pacers.join(' & ')} ${vibeEmoji}

Distance: ${distance.toFixed(2)} mi
Duration: ${durationStr}
Pace: ${paceStr}/mi
Hype Moments: ${hypeCount}

Powered by PACER`;
}
