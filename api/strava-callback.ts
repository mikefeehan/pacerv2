/**
 * Strava OAuth Callback Handler
 * This serverless function handles the OAuth callback from Strava
 *
 * Environment variables needed:
 * - STRAVA_CLIENT_ID
 * - STRAVA_CLIENT_SECRET
 *
 * Deployed to: https://pacer-backend.vercel.app/api/strava-callback
 *
 * Flow:
 * 1. User clicks "Connect Strava" in app
 * 2. Browser opens Strava OAuth with redirect_uri pointing to this endpoint
 * 3. Strava redirects to this function with authorization code
 * 4. This function exchanges code for tokens with Strava
 * 5. This function redirects back to app with deep link: vibecode://strava-callback?accessToken=...
 */

export default async function handler(req: any, res: any) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    res.status(200).end();
    return;
  }

  try {
    const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || '';
    const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '';

    const { code, error, state } = req.query;

    console.log('Strava OAuth callback received:', { code, error, state });

    // Check for errors from Strava
    if (error) {
      const errorMessage = Array.isArray(error) ? error[0] : error;
      console.error('Strava OAuth error:', errorMessage);
      return res.redirect(
        `vibecode://strava-callback?error=${encodeURIComponent(errorMessage)}`
      );
    }

    // Validate code
    if (!code) {
      console.error('No authorization code received');
      return res.redirect('vibecode://strava-callback?error=no_code');
    }

    const authCode = Array.isArray(code) ? code[0] : code;

    // Exchange code for tokens
    console.log('Exchanging code for tokens...');
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
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorText);
      return res.redirect('vibecode://strava-callback?error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');

    // Extract token data
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresAt = tokenData.expires_at;
    const athleteId = tokenData.athlete?.id?.toString() || '';

    if (!accessToken || !refreshToken || !expiresAt || !athleteId) {
      console.error('Missing token data:', { accessToken, refreshToken, expiresAt, athleteId });
      return res.redirect('vibecode://strava-callback?error=missing_token_data');
    }

    // Redirect back to app with tokens via deep link
    const deepLinkUrl = `vibecode://strava-callback?` +
      `accessToken=${encodeURIComponent(accessToken)}` +
      `&refreshToken=${encodeURIComponent(refreshToken)}` +
      `&expiresAt=${encodeURIComponent(expiresAt)}` +
      `&athleteId=${encodeURIComponent(athleteId)}`;

    console.log('Redirecting to app with tokens');
    return res.redirect(deepLinkUrl);
  } catch (error) {
    console.error('Unexpected error in Strava callback:', error);
    return res.redirect('vibecode://strava-callback?error=unexpected_error');
  }
}

