/**
 * Strava OAuth Callback Handler
 *
 * This is a Vercel serverless function that:
 * 1. Receives the OAuth authorization code from Strava
 * 2. Exchanges it for access/refresh tokens with Strava API
 * 3. Returns tokens to the mobile app via deep link
 *
 * Environment variables (set in Vercel):
 * - STRAVA_CLIENT_ID
 * - STRAVA_CLIENT_SECRET
 */

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { code, error, error_description } = req.query;

    // Handle Strava error responses
    if (error) {
      const errorMsg = error_description || error;
      console.error('Strava OAuth error:', errorMsg);
      return res.redirect(
        `vibecode://strava-callback?error=${encodeURIComponent(errorMsg)}`
      );
    }

    // Validate authorization code
    if (!code) {
      console.error('No authorization code received');
      return res.redirect('vibecode://strava-callback?error=no_authorization_code');
    }

    const authCode = Array.isArray(code) ? code[0] : code;
    const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
    const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
      console.error('Missing Strava credentials in environment');
      return res.redirect('vibecode://strava-callback?error=server_misconfigured');
    }

    // Exchange authorization code for tokens
    console.log('Exchanging authorization code for tokens...');
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code: authCode,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorData);
      return res.redirect('vibecode://strava-callback?error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();

    // Validate token response
    const { access_token, refresh_token, expires_at, athlete } = tokenData;

    if (!access_token || !refresh_token || !expires_at || !athlete?.id) {
      console.error('Invalid token response from Strava:', tokenData);
      return res.redirect('vibecode://strava-callback?error=invalid_token_response');
    }

    console.log('Successfully exchanged code for tokens');

    // Redirect back to app with tokens as query parameters
    const deepLink = `vibecode://strava-callback?accessToken=${encodeURIComponent(access_token)}&refreshToken=${encodeURIComponent(refresh_token)}&expiresAt=${encodeURIComponent(expires_at.toString())}&athleteId=${encodeURIComponent(athlete.id.toString())}`;

    console.log('Redirecting to app with tokens');
    return res.redirect(deepLink);
  } catch (err) {
    console.error('Unexpected error in Strava callback handler:', err);
    return res.redirect('vibecode://strava-callback?error=unexpected_error');
  }
}


