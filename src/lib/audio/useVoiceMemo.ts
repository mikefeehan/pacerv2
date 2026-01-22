import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

type VoiceMemoState = {
  isReady: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  durationMs: number | null;
  uri: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  play: () => Promise<void>;
  reset: () => Promise<void>;
};

const RECORDING_OPTIONS = Audio.RecordingOptionsPresets.HIGH_QUALITY;

export function useVoiceMemo(): VoiceMemoState {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const [isReady, setIsReady] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncPermissions = useCallback(async () => {
    const { status } = await Audio.getPermissionsAsync();
    setIsReady(status === 'granted');
  }, []);

  useEffect(() => {
    void syncPermissions();
  }, [syncPermissions]);

  const clearSound = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current.setOnPlaybackStatusUpdate(null);
      soundRef.current = null;
    }
  }, []);

  const stopActiveRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
    } catch (stopError) {
      console.warn('Failed stopping recording:', stopError);
    } finally {
      recordingRef.current = null;
      setIsRecording(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const { status } = await Audio.requestPermissionsAsync();

      if (status !== 'granted') {
        setIsReady(false);
        setError('Microphone permission not granted.');
        return;
      }

      await clearSound();
      await stopActiveRecording();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          setDurationMs(status.durationMillis ?? null);
        }
      });

      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await recording.startAsync();

      recordingRef.current = recording;
      setUri(null);
      setDurationMs(0);
      setIsRecording(true);
      setIsReady(true);
    } catch (recordError) {
      console.error('Start recording failed:', recordError);
      setError('Unable to start recording.');
      setIsRecording(false);
    }
  }, [clearSound, stopActiveRecording]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const status = await recordingRef.current.getStatusAsync();
      const recordingUri = recordingRef.current.getURI();

      setDurationMs(status.durationMillis ?? null);
      setUri(recordingUri ?? null);
      setIsRecording(false);
      setIsReady(true);
    } catch (stopError) {
      console.error('Stop recording failed:', stopError);
      setError('Unable to stop recording.');
    } finally {
      recordingRef.current = null;
    }
  }, []);

  const play = useCallback(async () => {
    if (!uri || isRecording) return;

    try {
      setError(null);
      await clearSound();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const sound = new Audio.Sound();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          if (status.error) {
            setError(status.error);
          }
          return;
        }

        setDurationMs(status.durationMillis ?? null);
        setIsPlaying(status.isPlaying);

        if (status.didJustFinish) {
          setIsPlaying(false);
          void sound.unloadAsync();
        }
      });

      await sound.loadAsync({ uri }, { shouldPlay: true });
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (playError) {
      console.error('Playback failed:', playError);
      setError('Unable to play recording.');
      setIsPlaying(false);
    }
  }, [clearSound, isRecording, uri]);

  const reset = useCallback(async () => {
    setError(null);
    await clearSound();
    await stopActiveRecording();
    setUri(null);
    setDurationMs(null);
    setIsPlaying(false);
  }, [clearSound, stopActiveRecording]);

  useEffect(() => {
    return () => {
      void clearSound();
      void stopActiveRecording();
    };
  }, [clearSound, stopActiveRecording]);

  return {
    isReady,
    isRecording,
    isPlaying,
    durationMs,
    uri,
    error,
    startRecording,
    stopRecording,
    play,
    reset,
  };
}
