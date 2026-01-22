import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

type VoiceMemoState = {
  isReady: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  durationMs: number | null;
  uri: string | null;
  error: string | null;
};

export function useVoiceMemo() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const [state, setState] = useState<VoiceMemoState>({
    isReady: false,
    isRecording: false,
    isPlaying: false,
    durationMs: null,
    uri: null,
    error: null,
  });

  const setError = (msg: string) =>
    setState((s) => ({ ...s, error: msg }));

  const configureAudio = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      setState((s) => ({ ...s, isReady: true, error: null }));
      return true;
    } catch (error: unknown) {
      setState((s) => ({ ...s, isReady: false }));
      const message = error instanceof Error ? error.message : 'Failed to configure audio';
      setError(message);
      return false;
    }
  }, []);

  const onRecordingStatusUpdate = useCallback((status: Audio.RecordingStatus) => {
    if (!status?.isRecording) return;
    setState((s) => ({
      ...s,
      durationMs: typeof status.durationMillis === 'number' ? status.durationMillis : s.durationMs,
    }));
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState((s) => ({ ...s, error: null }));

      const ok = state.isReady ? true : await configureAudio();
      if (!ok) return null;

      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
        } catch {}
        try {
          await soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;
      }

      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch {}
        recordingRef.current = null;
      }

      const recording = new Audio.Recording();
      recording.setOnRecordingStatusUpdate(onRecordingStatusUpdate);
      recordingRef.current = recording;

      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      setState((s) => ({
        ...s,
        isRecording: true,
        uri: null,
        durationMs: 0,
      }));

      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to start recording';
      setError(message);
      setState((s) => ({ ...s, isRecording: false }));
      return null;
    }
  }, [configureAudio, onRecordingStatusUpdate, state.isReady]);

  const stopRecording = useCallback(async () => {
    try {
      const recording = recordingRef.current;
      if (!recording) return null;

      setState((s) => ({ ...s, error: null }));

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI() ?? null;

      recordingRef.current = null;

      if (!uri) throw new Error('Recording produced no file URI');

      setState((s) => ({
        ...s,
        isRecording: false,
        uri,
      }));

      return uri;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to stop recording';
      setError(message);
      setState((s) => ({ ...s, isRecording: false }));
      return null;
    }
  }, []);

  const play = useCallback(async (overrideUri?: string) => {
    try {
      const uri = overrideUri ?? state.uri;
      if (!uri) throw new Error('No recording available to play');

      setState((s) => ({ ...s, error: null }));

      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
        } catch {}
        try {
          await soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setState((s) => ({ ...s, isPlaying: false }));
          void sound.unloadAsync();
          soundRef.current = null;
        }
      });

      setState((s) => ({ ...s, isPlaying: true }));
      await sound.playAsync();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to play recording';
      setError(message);
      setState((s) => ({ ...s, isPlaying: false }));
      return null;
    }
  }, [state.uri]);

  const stopPlayback = useCallback(async () => {
    try {
      if (!soundRef.current) return;
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setState((s) => ({ ...s, isPlaying: false }));
    } catch {
      // ignore
    }
  }, []);

  const reset = useCallback(async () => {
    await stopPlayback();
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }
    setState((s) => ({
      ...s,
      isRecording: false,
      isPlaying: false,
      durationMs: null,
      uri: null,
      error: null,
    }));
  }, [stopPlayback]);

  useEffect(() => {
    configureAudio();

    return () => {
      void (async () => {
        try {
          if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
            recordingRef.current = null;
          }
        } catch {}
        try {
          if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        } catch {}
      })();
    };
  }, [configureAudio]);

  return {
    ...state,
    configureAudio,
    startRecording,
    stopRecording,
    play,
    stopPlayback,
    reset,
  };
}
