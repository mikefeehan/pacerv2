import * as Speech from 'expo-speech';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

let audioInitialized = false;

// Initialize audio session for mixing with Spotify/music
export async function initializeAudioSession(): Promise<void> {
  if (audioInitialized) return;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    audioInitialized = true;
    console.log('Audio session initialized successfully');
  } catch (error) {
    console.error('Failed to initialize audio session:', error);
  }
}

// Speak a line with priority handling (voice overlays on Spotify)
export async function speakLine(text: string): Promise<void> {
  try {
    // Initialize audio first
    await initializeAudioSession();

    console.log('Speaking:', text);

    return new Promise((resolve, reject) => {
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1,
        rate: 0.9, // Slightly slower for clarity
        volume: 1.0,
        onStart: () => {
          console.log('Speech started');
        },
        onDone: () => {
          console.log('Speech completed');
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

// Test speech - call this to verify audio is working
export async function testSpeech(): Promise<boolean> {
  try {
    await initializeAudioSession();
    console.log('Testing speech...');

    return new Promise((resolve) => {
      Speech.speak('PACER is ready to help you run!', {
        language: 'en-US',
        pitch: 1,
        rate: 0.9,
        volume: 1.0,
        onStart: () => {
          console.log('Test speech started');
        },
        onDone: () => {
          console.log('Test speech completed successfully');
          resolve(true);
        },
        onError: (error) => {
          console.error('Test speech error:', error);
          resolve(false);
        },
      });
    });
  } catch (error) {
    console.error('Test speech failed:', error);
    return false;
  }
}

// Check if speech is available
export async function isSpeechAvailable(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    console.log(`Found ${voices.length} voices`);
    return voices.length > 0;
  } catch (e) {
    return false;
  }
}
