import * as Location from 'expo-location';

// GPS Point recorded during run
export interface GPSPoint {
  latitude: number;
  longitude: number;
  altitude: number | null;
  timestamp: string; // ISO string
  accuracy: number | null;
  speed: number | null; // meters per second
}

// Calculate distance between two GPS points using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Calculate pace from speed (m/s to min/mile)
export function speedToPace(speedMs: number | null): number {
  if (!speedMs || speedMs <= 0) return 0;
  const mileInMeters = 1609.34;
  const secondsPerMile = mileInMeters / speedMs;
  return secondsPerMile / 60; // minutes per mile
}

// Calculate total distance from GPS points
export function calculateTotalDistance(points: GPSPoint[]): number {
  if (points.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistance += calculateDistance(
      points[i - 1].latitude,
      points[i - 1].longitude,
      points[i].latitude,
      points[i].longitude
    );
  }
  return totalDistance;
}

// Calculate average pace from GPS points
export function calculateAveragePace(points: GPSPoint[]): number {
  if (points.length < 2) return 0;

  const totalDistance = calculateTotalDistance(points);
  if (totalDistance === 0) return 0;

  const startTime = new Date(points[0].timestamp).getTime();
  const endTime = new Date(points[points.length - 1].timestamp).getTime();
  const durationMinutes = (endTime - startTime) / 1000 / 60;

  return durationMinutes / totalDistance; // minutes per mile
}

// Calculate rolling pace (last N points)
export function calculateRollingPace(points: GPSPoint[], windowSize: number = 10): number {
  if (points.length < 2) return 0;

  const recentPoints = points.slice(-windowSize);
  return calculateAveragePace(recentPoints);
}

// Generate GPX file content from GPS points
export function generateGPX(
  points: GPSPoint[],
  name: string,
  description: string
): string {
  if (points.length === 0) return '';

  const startTime = points[0].timestamp;

  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="PACER App"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(name)}</name>
    <desc>${escapeXml(description)}</desc>
    <time>${startTime}</time>
  </metadata>
  <trk>
    <name>${escapeXml(name)}</name>
    <type>running</type>
    <trkseg>
`;

  for (const point of points) {
    gpx += `      <trkpt lat="${point.latitude}" lon="${point.longitude}">
`;
    if (point.altitude !== null) {
      gpx += `        <ele>${point.altitude.toFixed(1)}</ele>
`;
    }
    gpx += `        <time>${point.timestamp}</time>
`;
    gpx += `      </trkpt>
`;
  }

  gpx += `    </trkseg>
  </trk>
</gpx>`;

  return gpx;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Request location permissions
export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

  if (foregroundStatus !== 'granted') {
    return false;
  }

  // Try to get background permissions for better tracking
  // This is optional - foreground is enough for basic tracking
  try {
    await Location.requestBackgroundPermissionsAsync();
  } catch (e) {
    // Background permission not critical
    console.log('Background location not available');
  }

  return true;
}

// Check if location services are enabled
export async function checkLocationServices(): Promise<boolean> {
  const enabled = await Location.hasServicesEnabledAsync();
  return enabled;
}

// Start watching location - returns a subscription
export async function startLocationTracking(
  onLocation: (point: GPSPoint) => void,
  options?: {
    accuracy?: Location.Accuracy;
    distanceInterval?: number;
    timeInterval?: number;
  }
): Promise<Location.LocationSubscription> {
  const subscription = await Location.watchPositionAsync(
    {
      accuracy: options?.accuracy ?? Location.Accuracy.BestForNavigation,
      distanceInterval: options?.distanceInterval ?? 5, // 5 meters
      timeInterval: options?.timeInterval ?? 1000, // 1 second
    },
    (location) => {
      const point: GPSPoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        timestamp: new Date(location.timestamp).toISOString(),
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
      };
      onLocation(point);
    }
  );

  return subscription;
}

// Get current location once
export async function getCurrentLocation(): Promise<GPSPoint | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      timestamp: new Date(location.timestamp).toISOString(),
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
    };
  } catch (e) {
    console.error('Failed to get current location:', e);
    return null;
  }
}

// Calculate bounding box for GPS points (for map display)
export function getBoundingBox(points: GPSPoint[]): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  centerLat: number;
  centerLon: number;
} | null {
  if (points.length === 0) return null;

  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLon = points[0].longitude;
  let maxLon = points[0].longitude;

  for (const point of points) {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLon = Math.min(minLon, point.longitude);
    maxLon = Math.max(maxLon, point.longitude);
  }

  return {
    minLat,
    maxLat,
    minLon,
    maxLon,
    centerLat: (minLat + maxLat) / 2,
    centerLon: (minLon + maxLon) / 2,
  };
}

// Format pace for display (e.g., "8:30")
export function formatPace(paceMinPerMile: number): string {
  if (!paceMinPerMile || paceMinPerMile <= 0 || paceMinPerMile > 60) return '--:--';

  const mins = Math.floor(paceMinPerMile);
  const secs = Math.round((paceMinPerMile - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format duration for display (e.g., "25:30" or "1:05:30")
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format distance for display
export function formatDistance(miles: number): string {
  return miles.toFixed(2);
}
