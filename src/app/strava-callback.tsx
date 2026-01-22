import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

/**
 * This route handles the OAuth callback from Strava.
 * When the user authorizes the app in Strava, it redirects to vibecode://strava-callback?code=...
 * This component receives the code and stores it in AsyncStorage for the OAuth flow.
 */
export default function StravaCallback() {
  const { code, error } = useLocalSearchParams<{ code?: string; error?: string }>();
  const router = useRouter();

  useEffect(() => {
    // The OAuth flow in strava-api.ts handles the actual token exchange
    // This route just serves as the redirect target for Strava
    // The app will automatically handle the callback through WebBrowser.openAuthSessionAsync

    // Just go back to where the user came from
    router.back();
  }, [router, code, error]);

  return <View style={{ flex: 1 }} />;
}
