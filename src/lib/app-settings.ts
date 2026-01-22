import * as SecureStore from 'expo-secure-store';

const STRAVA_AUTO_UPLOAD_KEY = 'strava_auto_upload';

export interface AppSettingsState {
  stravaAutoUpload: boolean;
}

// Get auto-upload setting
export async function getStravaAutoUpload(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(STRAVA_AUTO_UPLOAD_KEY);
    // Default to true if not set
    return value === null ? true : value === 'true';
  } catch (e) {
    console.error('Failed to get Strava auto-upload setting:', e);
    return true; // Default to true on error
  }
}

// Set auto-upload setting
export async function setStravaAutoUpload(enabled: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(STRAVA_AUTO_UPLOAD_KEY, enabled.toString());
  } catch (e) {
    console.error('Failed to set Strava auto-upload setting:', e);
  }
}
