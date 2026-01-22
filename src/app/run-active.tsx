import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Modal, Alert } from 'react-native';
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
import { Square, Volume2, Vibrate, MapPin } from 'lucide-react-native';
import { PacerLogo } from '@/components/PacerLogo';
import { Button } from '@/components/Button';
import { usePacerStore, useRunSettingsStore } from '@/lib/stores';
import { useActiveRunStore, STRUGGLE_CONFIG } from '@/lib/run-store';
import {
  getAIVoiceLine,
  getMemoForPacer,
  getTrackForPacer,
} from '@/lib/mock-data';
import { VIBES } from '@/lib/types';
import type { TriggerType } from '@/lib/types';
import { triggerHypeHaptics, stopHaptics, getHapticPatternDescription } from '@/lib/haptics';
import * as Haptics from 'expo-haptics';
import {
  requestLocationPermissions,
  startLocationTracking,
  calculateTotalDistance,
  calculateRollingPace,
  speedToPace,
  formatPace,
  formatDuration,
  type GPSPoint,
} from '@/lib/gps-tracking';
import type * as Location from 'expo-location';

export default function RunActiveScreen() {
  const router = useRouter();

  const pacers = usePacerStore((s) => s.pacers);
  const selectedPacerIds = useRunSettingsStore((s) => s.selectedPacerIds);
  const voiceMode = useRunSettingsStore((s) => s.voiceMode);
  const vibe = useRunSettingsStore((s) => s.vibe);
  const musicEnabled = useRunSettingsStore((s) => s.musicEnabled);
  const hapticSettings = useRunSettingsStore((s) => s.hapticSettings);

  const startRun = useActiveRunStore((s) => s.startRun);
  const endRun = useActiveRunStore((s) => s.endRun);
  const updateStats = useActiveRunStore((s) => s.updateStats);
  const addHypeEvent = useActiveRunStore((s) => s.addHypeEvent);
  const stats = useActiveRunStore((s) => s.stats);
  const hypeEventCount = useActiveRunStore((s) => s.hypeEventCount);
  const lastHypeEventTime = useActiveRunStore((s) => s.lastHypeEventTime);
  const usedMemoIds = useActiveRunStore((s) => s.usedMemoIds);
  const usedTrackIds = useActiveRunStore((s) => s.usedTrackIds);
  const markMemoUsed = useActiveRunStore((s) => s.markMemoUsed);
  const markTrackUsed = useActiveRunStore((s) => s.markTrackUsed);
  const getNextPacerIndex = useActiveRunStore((s) => s.getNextPacerIndex);
  const addGPSPoint = useActiveRunStore((s) => s.addGPSPoint);
  const setIsTrackingGPS = useActiveRunStore((s) => s.setIsTrackingGPS);
  const gpsPoints = useActiveRunStore((s) => s.gpsPoints);

  const selectedPacers = pacers.filter((p) => selectedPacerIds.includes(p.pacerUserId));
  const pacerNames = selectedPacers.map(p => p.pacerName).join(' + ');
  const vibeConfig = VIBES.find(v => v.type === vibe);

  const [showHypeOverlay, setShowHypeOverlay] = useState(false);
  const [hypeMessage, setHypeMessage] = useState('');
  const [currentPacerName, setCurrentPacerName] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [hapticsActive, setHapticsActive] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'requesting' | 'tracking' | 'error'>('requesting');

  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const usedLinesRef = useRef(new Set<string>());
  const baselinePaceRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Start the run session and GPS tracking
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

    startTimeRef.current = Date.now();

    // Start GPS tracking
    initializeGPSTracking();

    // Start elapsed time timer
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      updateStats({ elapsedTime: elapsed });
    }, 1000);

    return () => {
      // Cleanup
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopHaptics();
    };
  }, []);

  const initializeGPSTracking = async () => {
    const hasPermission = await requestLocationPermissions();

    if (!hasPermission) {
      setGpsStatus('error');
      Alert.alert(
        'Location Required',
        'PACER needs location access to track your run. Please enable location in Settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const subscription = await startLocationTracking((point: GPSPoint) => {
        addGPSPoint(point);
        updateStatsFromGPS(point);
      });

      locationSubscriptionRef.current = subscription;
      setIsTrackingGPS(true);
      setGpsStatus('tracking');
    } catch (error) {
      console.error('Failed to start GPS tracking:', error);
      setGpsStatus('error');
    }
  };

  const updateStatsFromGPS = (newPoint: GPSPoint) => {
    const points = [...gpsPoints, newPoint];

    // Calculate distance from all GPS points
    const totalDistance = calculateTotalDistance(points);

    // Calculate current pace from speed
    const currentPace = speedToPace(newPoint.speed);

    // Calculate rolling pace from recent points
    const rollingPace = calculateRollingPace(points, 10);

    // Set baseline pace after warmup (6 minutes)
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    if (elapsed >= 360 && baselinePaceRef.current === 0 && rollingPace > 0) {
      baselinePaceRef.current = rollingPace;
    }

    updateStats({
      distance: totalDistance,
      currentPace: currentPace || rollingPace,
      rollingPace,
    });

    // Check for struggle triggers
    checkForStruggles(elapsed, totalDistance, rollingPace);
  };

  const checkForStruggles = (elapsed: number, distance: number, rollingPace: number) => {
    // Check cooldown and max events
    const now = Date.now();
    const cooldownMs = STRUGGLE_CONFIG.COOLDOWN_SECONDS * 1000;

    if (lastHypeEventTime && now - lastHypeEventTime < cooldownMs) {
      return;
    }

    if (hypeEventCount >= STRUGGLE_CONFIG.MAX_EVENTS) {
      return;
    }

    // Check minimum thresholds
    if (elapsed < STRUGGLE_CONFIG.MIN_TIME_SECONDS || distance < STRUGGLE_CONFIG.MIN_DISTANCE_MILES) {
      return;
    }

    // Pace drop trigger
    if (baselinePaceRef.current > 0 && rollingPace > 0) {
      const paceIncrease = (rollingPace - baselinePaceRef.current) / baselinePaceRef.current;
      if (paceIncrease >= STRUGGLE_CONFIG.PACE_DROP_THRESHOLD) {
        triggerHypeEvent('pace_drop');
        return;
      }
    }

    // Stall trigger (after mile 2)
    if (distance >= STRUGGLE_CONFIG.STALL_MIN_DISTANCE && baselinePaceRef.current > 0) {
      const paceIncrease = (rollingPace - baselinePaceRef.current) / baselinePaceRef.current;
      if (paceIncrease >= STRUGGLE_CONFIG.STALL_PACE_THRESHOLD) {
        triggerHypeEvent('stall');
        return;
      }
    }
  };

  const triggerHypeEvent = async (triggerType: TriggerType) => {
    // Trigger haptics 0.2s BEFORE voice (as per spec)
    if (hapticSettings.enabled) {
      setHapticsActive(true);
      setTimeout(() => {
        triggerHypeHaptics(vibe, hapticSettings);
      }, 200);
    }

    // Basic notification haptic as backup
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
        voiceType = 'ai';
        generatedText = getAIVoiceLine(vibe, usedLinesRef.current);
        usedLinesRef.current.add(generatedText);
      }
    } else {
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

    // Hide overlay after a few seconds and stop haptics
    setTimeout(() => {
      setShowHypeOverlay(false);
      setHapticsActive(false);
      stopHaptics();
    }, 4000);
  };

  const handleEndRun = () => {
    // Clean up
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopHaptics();
    setIsTrackingGPS(false);

    const completedSession = endRun();
    if (completedSession) {
      router.replace('/run-recap');
    }
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
            {gpsStatus === 'tracking'
              ? 'Tracking your run...'
              : gpsStatus === 'requesting'
              ? 'Getting GPS signal...'
              : 'GPS unavailable - tracking time only'}
          </Text>

          {/* GPS Status Indicator */}
          <View className="flex-row items-center mt-3">
            <MapPin
              size={14}
              color={gpsStatus === 'tracking' ? '#34D399' : gpsStatus === 'requesting' ? '#FBBF24' : '#EF4444'}
            />
            <Text className={`ml-1.5 text-sm ${
              gpsStatus === 'tracking' ? 'text-green-400' :
              gpsStatus === 'requesting' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {gpsStatus === 'tracking' ? 'GPS Active' : gpsStatus === 'requesting' ? 'Connecting...' : 'No GPS'}
            </Text>
          </View>

          {/* Pacers + Vibe */}
          <View className="mt-6 bg-pacer-surface px-6 py-3 rounded-full">
            <Text className="text-pacer-accent font-medium">
              {pacerNames} — {vibeConfig?.emoji} {vibeConfig?.label}
            </Text>
          </View>

          {/* Live Stats */}
          <View className="flex-row items-center mt-12 gap-x-8">
            <View className="items-center">
              <Text className="text-pacer-muted text-sm">Time</Text>
              <Text className="text-pacer-white text-lg font-mono">
                {formatDuration(Math.round(stats.elapsedTime))}
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

            {/* Haptics Indicator */}
            {hapticsActive && hapticSettings.enabled && (
              <View className="flex-row items-center mt-6 bg-white/10 px-4 py-2 rounded-full">
                <Vibrate size={16} color="#FF6B35" />
                <Text className="text-pacer-accent text-sm ml-2">
                  Haptics: {getHapticPatternDescription(vibe)}
                </Text>
              </View>
            )}
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
