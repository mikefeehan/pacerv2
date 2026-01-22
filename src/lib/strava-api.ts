import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Strava OAuth Configuration
// You need to set these in the ENV tab of Vibecode
const STRAVA_CLIENT_ID = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID || '';
const STRAVA_CLIENT_SECRET = process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET || '';
const STRAVA_REDIRECT_URI = Linking.createURL('strava-callback');

// Storage keys
const STRAVA_ACCESS_TOKEN_KEY = 'strava_access_token';
const STRAVA_REFRESH_TOKEN_KEY = 'strava_refresh_token';
const STRAVA_TOKEN_EXPIRY_KEY = 'strava_token_expiry';
const STRAVA_ATHLETE_ID_KEY = 'strava_athlete_id';

export interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  athleteId: string;
}

export interface StravaUploadResult {
  success: boolean;
  activityId?: string;
  error?: string;
}

// Check if Strava is configured
export function isStravaConfigured(): boolean {
  return !!(STRAVA_CLIENT_ID && STRAVA_CLIENT_SECRET);
}

// Get stored tokens
export async function getStoredTokens(): Promise<StravaTokens | null> {
  try {
    const [accessToken, refreshToken, expiresAt, athleteId] = await Promise.all([
      AsyncStorage.getItem(STRAVA_ACCESS_TOKEN_KEY),
      AsyncStorage.getItem(STRAVA_REFRESH_TOKEN_KEY),
      AsyncStorage.getItem(STRAVA_TOKEN_EXPIRY_KEY),
      AsyncStorage.getItem(STRAVA_ATHLETE_ID_KEY),
    ]);

    if (!accessToken || !refreshToken || !expiresAt || !athleteId) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: parseInt(expiresAt, 10),
      athleteId,
    };
  } catch (e) {
    console.error('Failed to get stored Strava tokens:', e);
    return null;
  }
}

// Store tokens
export async function storeTokens(tokens: StravaTokens): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(STRAVA_ACCESS_TOKEN_KEY, tokens.accessToken),
      AsyncStorage.setItem(STRAVA_REFRESH_TOKEN_KEY, tokens.refreshToken),
      AsyncStorage.setItem(STRAVA_TOKEN_EXPIRY_KEY, tokens.expiresAt.toString()),
      AsyncStorage.setItem(STRAVA_ATHLETE_ID_KEY, tokens.athleteId),
    ]);
  } catch (e) {
    console.error('Failed to store Strava tokens:', e);
  }
}

// Clear tokens (logout)
export async function clearStravaTokens(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STRAVA_ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(STRAVA_REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(STRAVA_TOKEN_EXPIRY_KEY),
      AsyncStorage.removeItem(STRAVA_ATHLETE_ID_KEY),
    ]);
  } catch (e) {
    console.error('Failed to clear Strava tokens:', e);
  }
}

// Check if tokens are expired
export function isTokenExpired(tokens: StravaTokens): boolean {
  // Add 5 minute buffer
  return Date.now() / 1000 > tokens.expiresAt - 300;
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<StravaTokens | null> {
  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    const tokens: StravaTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      athleteId: data.athlete?.id?.toString() || '',
    };

    await storeTokens(tokens);
    return tokens;
  } catch (e) {
    console.error('Failed to refresh Strava token:', e);
    return null;
  }
}

// Get valid access token (refreshes if needed)
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getStoredTokens();

  if (!tokens) {
    return null;
  }

  if (isTokenExpired(tokens)) {
    const newTokens = await refreshAccessToken(tokens.refreshToken);
    return newTokens?.accessToken || null;
  }

  return tokens.accessToken;
}

// Start OAuth flow
export async function startStravaOAuth(): Promise<StravaTokens | null> {
  if (!isStravaConfigured()) {
    console.error('Strava not configured. Add STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET to ENV.');
    return null;
  }

  try {
    // Build OAuth URL
    const authUrl = `https://www.strava.com/oauth/mobile/authorize?` +
      `client_id=${STRAVA_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}` +
      `&response_type=code` +
      `&approval_prompt=auto` +
      `&scope=activity:write,activity:read_all`;

    // Open browser for OAuth
    const result = await WebBrowser.openAuthSessionAsync(authUrl, STRAVA_REDIRECT_URI);

    if (result.type !== 'success' || !result.url) {
      return null;
    }

    // Parse the authorization code from the URL
    const urlParams = new URL(result.url);
    const code = urlParams.searchParams.get('code');

    if (!code) {
      console.error('No authorization code received');
      return null;
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokenData = await tokenResponse.json();

    const tokens: StravaTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_at,
      athleteId: tokenData.athlete?.id?.toString() || '',
    };

    await storeTokens(tokens);
    return tokens;
  } catch (e) {
    console.error('Strava OAuth failed:', e);
    return null;
  }
}

// Upload GPX file to Strava
export async function uploadGPXToStrava(
  gpxContent: string,
  name: string,
  description: string,
  activityType: string = 'run'
): Promise<StravaUploadResult> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return {
      success: false,
      error: 'Not authenticated with Strava. Please connect your account.',
    };
  }

  try {
    // Create form data for upload
    const formData = new FormData();

    // Create a blob-like object for the GPX file
    const gpxBlob = {
      uri: 'data:application/gpx+xml;base64,' + btoa(unescape(encodeURIComponent(gpxContent))),
      type: 'application/gpx+xml',
      name: 'activity.gpx',
    } as any;

    formData.append('file', gpxBlob);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('data_type', 'gpx');
    formData.append('activity_type', activityType);

    const response = await fetch('https://www.strava.com/api/v3/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const uploadData = await response.json();

    // The upload is asynchronous - we get an upload ID
    // We need to poll to get the activity ID
    const activityId = await pollForActivityId(accessToken, uploadData.id);

    return {
      success: true,
      activityId,
    };
  } catch (e) {
    console.error('Failed to upload to Strava:', e);
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Upload failed',
    };
  }
}

// Poll for activity ID after upload
async function pollForActivityId(
  accessToken: string,
  uploadId: string,
  maxAttempts: number = 10
): Promise<string | undefined> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

    try {
      const response = await fetch(
        `https://www.strava.com/api/v3/uploads/${uploadId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) continue;

      const data = await response.json();

      if (data.activity_id) {
        return data.activity_id.toString();
      }

      if (data.error) {
        console.error('Upload error:', data.error);
        return undefined;
      }
    } catch (e) {
      console.error('Polling error:', e);
    }
  }

  return undefined;
}

// Update activity description on Strava
export async function updateActivityDescription(
  activityId: string,
  description: string
): Promise<boolean> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return false;
  }

  try {
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      }
    );

    return response.ok;
  } catch (e) {
    console.error('Failed to update activity:', e);
    return false;
  }
}

// Check if user is connected to Strava (has valid tokens)
export async function isStravaConnected(): Promise<boolean> {
  const tokens = await getStoredTokens();
  if (!tokens) return false;

  // Try to get a valid token (will refresh if needed)
  const accessToken = await getValidAccessToken();
  return !!accessToken;
}
