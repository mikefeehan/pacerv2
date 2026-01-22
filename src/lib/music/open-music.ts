import * as Linking from 'expo-linking';

/**
 * Open Spotify with search query
 * Format: spotify:search:artist+track+name
 */
export async function openSpotifySearch(query: string): Promise<void> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const spotifyUrl = `spotify:search:${encodedQuery}`;

    // Try Spotify deep link first
    const canOpen = await Linking.canOpenURL(spotifyUrl);
    if (canOpen) {
      await Linking.openURL(spotifyUrl);
      return;
    }

    // Fallback to web search
    const webUrl = `https://open.spotify.com/search/${encodedQuery}`;
    await Linking.openURL(webUrl);
  } catch (error) {
    console.error('Failed to open Spotify:', error);
  }
}

/**
 * Open Apple Music with search query
 * Format: music://search?term=artist+track
 */
export async function openAppleMusicSearch(query: string): Promise<void> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const appleMusicUrl = `music://search?term=${encodedQuery}`;

    const canOpen = await Linking.canOpenURL(appleMusicUrl);
    if (canOpen) {
      await Linking.openURL(appleMusicUrl);
      return;
    }

    // Fallback to web
    const webUrl = `https://music.apple.com/search?term=${encodedQuery}`;
    await Linking.openURL(webUrl);
  } catch (error) {
    console.error('Failed to open Apple Music:', error);
  }
}
