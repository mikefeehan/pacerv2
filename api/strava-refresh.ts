/**
 * Strava OAuth Refresh Handler
 *
 * This is a Vercel serverless function that:
 * 1. Receives a refresh token from the mobile app
 * 2. Exchanges it for a new access token via Strava API
 * 3. Returns the refreshed tokens to the app
 *
 * Environment variables (set in Vercel):
 * - STRAVA_CLIENT_ID
 * - STRAVA_CLIENT_SECRET
 */

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const refreshToken = body?.refreshToken;

    if (!refreshToken) {
      res.status(400).json({ error: 'Missing refresh token' });
      return;
    }

    const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
    const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
      res.status(500).json({ error: 'Server misconfigured' });
      return;
    }

    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
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

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Refresh token exchange failed:', tokenResponse.status, errorData);
      res.status(502).json({ error: 'Token refresh failed' });
      return;
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_at } = tokenData;

    if (!access_token || !refresh_token || !expires_at) {
      res.status(502).json({ error: 'Invalid refresh response' });
      return;
    }

    res.status(200).json({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: expires_at,
    });
  } catch (err) {
    console.error('Unexpected error refreshing Strava token:', err);
    res.status(500).json({ error: 'Unexpected error' });
  }
}
