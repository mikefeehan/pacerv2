import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
} from 'react-native-reanimated';
import { Square, Volume2 } from 'lucide-react-native';
import { PacerLogo } from '@/components/PacerLogo';
import { Button } from '@/components/Button';
import { usePacerStore, useRunSettingsStore } from '@/lib/stores';
import { useActiveRunStore, checkForStruggle, STRUGGLE_CONFIG } from '@/lib/run-store';
import {
  DEMO_RUN_POINTS,
  getAIVoiceLine,
  getTrackForPhase,
  MOCK_VOICE_MEMOS_ASHLEY,
} from '@/lib/mock-data';
import type { TriggerType } from '@/lib/types';
import * as Haptics from 'expo-haptics';

export default function RunActiveScreen() {
  const router = useRouter();

  const pacers = usePacerStore((s) => s.pacers);
  const selectedPacerId = useRunSettingsStore((s) => s.selectedPacerId);
  const voiceMode = useRunSettingsStore((s) => s.voiceMode);
  const tone = useRunSettingsStore((s) => s.tone);
  const intensity = useRunSettingsStore((s) => s.intensity);
  const musicEnabled = useRunSettingsStore((s) => s.musicEnabled);

  const startRun = useActiveRunStore((s) => s.startRun);
  const endRun = useActiveRunStore((s) => s.endRun);
  const updateStats = useActiveRunStore((s) => s.updateStats);
  const addHypeEvent = useActiveRunStore((s) => s.addHypeEvent);
  const stats = useActiveRunStore((s) => s.stats);
  const session = useActiveRunStore((s) => s.session);
  const hypeEventCount = useActiveRunStore((s) => s.hypeEventCount);
  const lastHypeEventTime = useActiveRunStore((s) => s.lastHypeEventTime);
  const usedMemoIds = useActiveRunStore((s) => s.usedMemoIds);
  const markMemoUsed = useActiveRunStore((s) => s.markMemoUsed);

  const selectedPacer = pacers.find((p) => p.pacerUserId === selectedPacerId);
  const pacerName = selectedPacer?.pacerName || 'Your Pacer';

  const [showHypeOverlay, setShowHypeOverlay] = useState(false);
  const [hypeMessage, setHypeMessage] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const simulationIndexRef = useRef(0);
  const usedLinesRef = useRef(new Set<string>());
  const usedTracksRef = useRef(new Set<string>());
  const baselinePaceRef = useRef(0);

  // Pulsing animation
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Start the run session
  useEffect(() => {
    if (!selectedPacer) {
      router.replace('/home');
      return;
    }

    startRun({
      runnerUserId: 'user_1',
      pacerUserId: selectedPacer.pacerUserId,
      pacerName: selectedPacer.pacerName,
      voiceMode,
      tone,
      intensity,
      musicEnabled,
    });

    // Start simulation
    const interval = setInterval(() => {
      const index = simulationIndexRef.current;
      if (index >= DEMO_RUN_POINTS.length) {
        clearInterval(interval);
        handleEndRun();
        return;
      }

      const point = DEMO_RUN_POINTS[index];
      const newStats = {
        elapsedTime: point.timeSeconds,
        distance: point.distanceMiles,
        currentPace: point.paceMinPerMile,
        rollingPace: point.paceMinPerMile,
        isRunning: true,
      };

      updateStats(newStats);

      // Set baseline pace after warmup
      if (point.timeSeconds >= 360 && baselinePaceRef.current === 0) {
        baselinePaceRef.current = point.paceMinPerMile;
      }

      // Check for triggers from demo data or detection logic
      if (point.trigger) {
        triggerHypeEvent(point.trigger, point.timeSeconds);
      }

      simulationIndexRef.current++;
    }, 1000); // 1 second = 1 "real" second in simulation

    return () => clearInterval(interval);
  }, []);

  const triggerHypeEvent = (triggerType: TriggerType, elapsedTime: number) => {
    // Check cooldown and max events
    const now = Date.now();
    const cooldownMs = STRUGGLE_CONFIG.COOLDOWN_BY_INTENSITY[intensity] * 1000;

    if (lastHypeEventTime && now - lastHypeEventTime < cooldownMs) {
      return;
    }

    if (hypeEventCount >= STRUGGLE_CONFIG.MAX_EVENTS) {
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Determine voice type and content
    let voiceType: 'real' | 'ai' = 'real';
    let memoId: string | undefined;
    let generatedText: string | undefined;

    if (voiceMode === 'ai_only') {
      voiceType = 'ai';
      generatedText = getAIVoiceLine(tone, triggerType, usedLinesRef.current);
      usedLinesRef.current.add(generatedText);
    } else if (voiceMode === 'real_only') {
      voiceType = 'real';
      const unusedMemos = MOCK_VOICE_MEMOS_ASHLEY.filter(
        (m) => !usedMemoIds.has(m.id) && (m.toneTag === tone || !m.toneTag)
      );
      const memo = unusedMemos[0] || MOCK_VOICE_MEMOS_ASHLEY[0];
      memoId = memo.id;
      generatedText = memo.name;
      markMemoUsed(memo.id);
    } else {
      // Mix mode - prefer real until 60-70% used
      const usedCount = usedMemoIds.size;
      const totalMemos = MOCK_VOICE_MEMOS_ASHLEY.length;
      const useReal = usedCount < totalMemos * 0.6;

      if (useReal) {
        voiceType = 'real';
        const unusedMemos = MOCK_VOICE_MEMOS_ASHLEY.filter((m) => !usedMemoIds.has(m.id));
        const memo = unusedMemos[0] || MOCK_VOICE_MEMOS_ASHLEY[0];
        memoId = memo.id;
        generatedText = memo.name;
        markMemoUsed(memo.id);
      } else {
        voiceType = 'ai';
        generatedText = getAIVoiceLine(tone, triggerType, usedLinesRef.current);
        usedLinesRef.current.add(generatedText);
      }
    }

    // Get track if music enabled
    let trackInfo: { trackId: string; trackName: string; artistName: string } | undefined;
    if (musicEnabled) {
      const totalDuration = DEMO_RUN_POINTS[DEMO_RUN_POINTS.length - 1].timeSeconds;
      trackInfo = getTrackForPhase(elapsedTime, totalDuration, usedTracksRef.current);
      usedTracksRef.current.add(trackInfo.trackId);
    }

    // Add hype event
    addHypeEvent({
      timestamp: new Date().toISOString(),
      triggerType,
      voiceType,
      memoId,
      generatedText,
      trackId: trackInfo?.trackId,
      trackName: trackInfo?.trackName,
      artistName: trackInfo?.artistName,
    });

    // Show overlay
    setHypeMessage(generatedText || "You've got this!");
    setShowHypeOverlay(true);

    // Hide overlay after a few seconds
    setTimeout(() => {
      setShowHypeOverlay(false);
    }, 4000);
  };

  const handleEndRun = () => {
    const completedSession = endRun();
    if (completedSession) {
      router.replace('/run-recap');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number) => {
    if (!pace || pace === 0) return '--:--';
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 bg-pacer-bg">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center px-6">
          {/* Pulsing Logo */}
          <Animated.View style={pulseStyle}>
            <PacerLogo size={140} animated intensity="active" />
          </Animated.View>

          {/* Status Text */}
          <Text className="text-2xl font-bold text-pacer-white mt-8">
            PACER is with you.
          </Text>
          <Text className="text-pacer-muted mt-2 text-center">
            Listening for struggle moments...
          </Text>

          {/* Pacer Name */}
          <View className="mt-8 bg-pacer-surface px-6 py-3 rounded-full">
            <Text className="text-pacer-accent font-medium">
              {pacerName} is pacing you
            </Text>
          </View>

          {/* Live Stats (subtle) */}
          <View className="flex-row items-center mt-12 gap-x-8">
            <View className="items-center">
              <Text className="text-pacer-muted text-sm">Time</Text>
              <Text className="text-pacer-white text-lg font-mono">
                {formatTime(Math.round(stats.elapsedTime))}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-pacer-muted text-sm">Distance</Text>
              <Text className="text-pacer-white text-lg font-mono">
                {stats.distance.toFixed(2)} mi
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-pacer-muted text-sm">Pace</Text>
              <Text className="text-pacer-white text-lg font-mono">
                {formatPace(stats.currentPace)}/mi
              </Text>
            </View>
          </View>

          {/* Hype Events Counter */}
          {hypeEventCount > 0 && (
            <View className="mt-8 flex-row items-center">
              <Volume2 size={16} color="#FF6B35" />
              <Text className="text-pacer-accent ml-2">
                {hypeEventCount} hype moment{hypeEventCount > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* End Run Button */}
        <View className="px-6 pb-4">
          <Pressable
            onPress={() => setShowEndConfirm(true)}
            className="flex-row items-center justify-center py-4 bg-pacer-surface rounded-xl active:bg-pacer-border"
          >
            <Square size={18} color="#EF4444" fill="#EF4444" />
            <Text className="text-red-400 font-semibold ml-2">End Run</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Hype Moment Overlay */}
      <Modal
        visible={showHypeOverlay}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/80 items-center justify-center px-8">
          <Animated.View
            entering={FadeIn.duration(300)}
            className="items-center"
          >
            <View className="w-20 h-20 rounded-full bg-pacer-accent items-center justify-center mb-6">
              <Volume2 size={36} color="#FFF" />
            </View>
            <Text className="text-pacer-accent text-lg font-semibold mb-2">
              {pacerName}'s pacing you
            </Text>
            <Text className="text-white text-2xl font-bold text-center leading-9">
              "{hypeMessage}"
            </Text>
          </Animated.View>
        </View>
      </Modal>

      {/* End Confirmation Modal */}
      <Modal
        visible={showEndConfirm}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/80 items-center justify-center px-8">
          <View className="bg-pacer-surface rounded-3xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-pacer-white text-center mb-2">
              End Run?
            </Text>
            <Text className="text-pacer-muted text-center mb-6">
              Your run will be saved and you'll see your recap.
            </Text>
            <View className="gap-y-3">
              <Button onPress={handleEndRun} variant="primary" fullWidth>
                End Run
              </Button>
              <Button
                onPress={() => setShowEndConfirm(false)}
                variant="ghost"
                fullWidth
              >
                Keep Running
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
