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
} from 'react-native-reanimated';
import { Square, Volume2 } from 'lucide-react-native';
import { PacerLogo } from '@/components/PacerLogo';
import { Button } from '@/components/Button';
import { usePacerStore, useRunSettingsStore } from '@/lib/stores';
import { useActiveRunStore, STRUGGLE_CONFIG } from '@/lib/run-store';
import {
  DEMO_RUN_POINTS,
  getAIVoiceLine,
  getMemoForPacer,
  getTrackForPacer,
} from '@/lib/mock-data';
import { VIBES } from '@/lib/types';
import type { TriggerType, VoiceMemo } from '@/lib/types';
import * as Haptics from 'expo-haptics';

export default function RunActiveScreen() {
  const router = useRouter();

  const pacers = usePacerStore((s) => s.pacers);
  const selectedPacerIds = useRunSettingsStore((s) => s.selectedPacerIds);
  const voiceMode = useRunSettingsStore((s) => s.voiceMode);
  const vibe = useRunSettingsStore((s) => s.vibe);
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
  const usedTrackIds = useActiveRunStore((s) => s.usedTrackIds);
  const markMemoUsed = useActiveRunStore((s) => s.markMemoUsed);
  const markTrackUsed = useActiveRunStore((s) => s.markTrackUsed);
  const getNextPacerIndex = useActiveRunStore((s) => s.getNextPacerIndex);

  const selectedPacers = pacers.filter((p) => selectedPacerIds.includes(p.pacerUserId));
  const pacerNames = selectedPacers.map(p => p.pacerName).join(' + ');
  const vibeConfig = VIBES.find(v => v.type === vibe);

  const [showHypeOverlay, setShowHypeOverlay] = useState(false);
  const [hypeMessage, setHypeMessage] = useState('');
  const [currentPacerName, setCurrentPacerName] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const simulationIndexRef = useRef(0);
  const usedLinesRef = useRef(new Set<string>());
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
    if (selectedPacers.length === 0) {
      router.replace('/home');
      return;
    }

    startRun({
      runnerUserId: 'user_1',
      pacerUserIds: selectedPacerIds,
      pacerNames: selectedPacers.map(p => p.pacerName),
      voiceMode,
      vibe,
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

      // Check for triggers from demo data
      if (point.trigger) {
        triggerHypeEvent(point.trigger);
      }

      simulationIndexRef.current++;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const triggerHypeEvent = (triggerType: TriggerType) => {
    // Check cooldown and max events
    const now = Date.now();
    const cooldownMs = STRUGGLE_CONFIG.COOLDOWN_SECONDS * 1000;

    if (lastHypeEventTime && now - lastHypeEventTime < cooldownMs) {
      return;
    }

    if (hypeEventCount >= STRUGGLE_CONFIG.MAX_EVENTS) {
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Select next pacer (rotate evenly)
    const pacerIndex = getNextPacerIndex();
    const selectedPacer = selectedPacers[pacerIndex];
    if (!selectedPacer) return;

    const pacerUserId = selectedPacer.pacerUserId;
    const pacerName = selectedPacer.pacerName;

    // Determine voice type and content
    let voiceType: 'real' | 'ai' = 'real';
    let memoId: string | undefined;
    let generatedText: string | undefined;

    if (voiceMode === 'ai_only') {
      voiceType = 'ai';
      generatedText = getAIVoiceLine(vibe, usedLinesRef.current);
      usedLinesRef.current.add(generatedText);
    } else if (voiceMode === 'real_only') {
      voiceType = 'real';
      const memo = getMemoForPacer(pacerUserId, vibe, usedMemoIds);
      if (memo) {
        memoId = memo.id;
        generatedText = memo.name;
        markMemoUsed(memo.id);
      } else {
        // Fallback to AI if no memos available
        voiceType = 'ai';
        generatedText = getAIVoiceLine(vibe, usedLinesRef.current);
        usedLinesRef.current.add(generatedText);
      }
    } else {
      // Mix mode - prefer real until we've used most of them
      const memo = getMemoForPacer(pacerUserId, vibe, usedMemoIds);
      if (memo && usedMemoIds.size < 4) {
        voiceType = 'real';
        memoId = memo.id;
        generatedText = memo.name;
        markMemoUsed(memo.id);
      } else {
        voiceType = 'ai';
        generatedText = getAIVoiceLine(vibe, usedLinesRef.current);
        usedLinesRef.current.add(generatedText);
      }
    }

    // Get track from the SAME pacer whose voice is playing
    let trackId: string | undefined;
    let trackName: string | undefined;
    let artistName: string | undefined;

    if (musicEnabled) {
      const track = getTrackForPacer(pacerUserId, usedTrackIds);
      if (track) {
        trackId = track.trackId;
        trackName = track.trackName;
        artistName = track.artistName;
        markTrackUsed(track.trackId);
      }
    }

    // Add hype event
    addHypeEvent({
      timestamp: new Date().toISOString(),
      triggerType,
      voiceType,
      pacerUserId,
      pacerName,
      memoId,
      generatedText,
      trackId,
      trackName,
      artistName,
    });

    // Show overlay
    setCurrentPacerName(pacerName);
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

          {/* Pacers + Vibe */}
          <View className="mt-8 bg-pacer-surface px-6 py-3 rounded-full">
            <Text className="text-pacer-accent font-medium">
              {pacerNames} — {vibeConfig?.emoji} {vibeConfig?.label}
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
              {currentPacerName}'s pacing you
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
