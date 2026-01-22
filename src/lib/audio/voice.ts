import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

// Initialize audio session for mixing with Spotify/music
export async function initializeAudioSession(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
  } catch (error) {
    console.error('Failed to initialize audio session:', error);
  }
}

// Speak a line with priority handling (voice overlays on Spotify)
export async function speakLine(text: string): Promise<void> {
  try {
    await initializeAudioSession();

    return new Promise((resolve, reject) => {
      Speech.speak(text, {
        language: 'en',
        pitch: 1,
        rate: 1,
        onDone: () => {
          resolve();
        },
        onError: (error) => {
          console.error('Speech error:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Failed to speak line:', error);
    throw error;
  }
}

// Stop speaking
export function stopSpeaking(): void {
  Speech.stop();
}

// Check if speech is available
export async function isSpeechAvailable(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.length > 0;
  } catch (e) {
    return false;
  }
}
