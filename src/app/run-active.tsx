import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Modal, Alert, Dimensions, Image } from 'react-native';
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
import MapView, { Marker, Polyline } from 'react-native-maps';
import { HeartPulse, MapPin, SkipForward, Square, Volume2, Vibrate } from 'lucide-react-native';
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
import { speakLine, stopSpeaking } from '@/lib/audio/voice';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  const selectedPacers = pacers.filter((p) => selectedPacerIds.includes(p.pacerUserId));
  const pacerNames = selectedPacers.map(p => p.pacerName).join(' + ');
  const vibeConfig = VIBES.find(v => v.type === vibe);

  const [showHypeOverlay, setShowHypeOverlay] = useState(false);
  const [hypeMessage, setHypeMessage] = useState('');
  const [currentPacerName, setCurrentPacerName] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [hapticsActive, setHapticsActive] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'requesting' | 'tracking' | 'error'>('requesting');
  const [heartRateConnected, setHeartRateConnected] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Local state for current position and route
  const [currentPosition, setCurrentPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const usedLinesRef = useRef(new Set<string>());
  const baselinePaceRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<MapView | null>(null);

  // Keep local copy of GPS points for accurate distance calculation
  const localGpsPointsRef = useRef<GPSPoint[]>([]);

  const spotifyTracks = useMemo(
    () => [
      {
        title: 'Late Night City Run',
        artist: 'Chrome Coast',
        artwork:
          'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=200&h=200&fit=crop&auto=format',
      },
      {
        title: 'Miles to Go',
        artist: 'Electric Youth',
        artwork:
          'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=200&h=200&fit=crop&auto=format',
      },
      {
        title: 'Run Faster',
        artist: 'Neon Skyline',
        artwork:
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&auto=format',
      },
    ],
    []
  );

  const currentTrack = spotifyTracks[currentTrackIndex];

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
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (!heartRateConnected) {
      setHeartRate(null);
      return;
    }

    setHeartRate(148);
    const interval = setInterval(() => {
      setHeartRate((prev) => {
        const base = prev ?? 148;
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(120, Math.min(178, base + delta));
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [heartRateConnected]);

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
    // Add to local ref for accurate calculation
    localGpsPointsRef.current = [...localGpsPointsRef.current, newPoint];
    const points = localGpsPointsRef.current;

    // Update route coordinates for map
    setRouteCoordinates(points.map(p => ({ latitude: p.latitude, longitude: p.longitude })));
    setCurrentPosition({ latitude: newPoint.latitude, longitude: newPoint.longitude });

    // Add to store
    addGPSPoint(newPoint);

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

    // Log for debugging
    console.log(`GPS Update: ${points.length} points, ${totalDistance.toFixed(3)} mi, pace: ${currentPace?.toFixed(1) || '--'}`);
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

    // Speak the hype message
    try {
      if (generatedText) {
        await speakLine(generatedText);
      }
    } catch (e) {
      console.error('Failed to speak hype message:', e);
    }

    // Hide overlay after a few seconds and stop haptics
    setTimeout(() => {
      setShowHypeOverlay(false);
      setHapticsActive(false);
      stopHaptics();
      stopSpeaking();
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
        <View className="flex-1">
          <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
            <Image
              source={require('../../public/chatgpt-image-jan-21--2026--06-19-03-pm-1.png')}
              style={{ width: 120, height: 40 }}
              resizeMode="contain"
            />
            <View className="flex-row items-center rounded-full bg-black/40 px-3 py-1.5 border border-pacer-border/60">
              <MapPin
                size={12}
                color={gpsStatus === 'tracking' ? '#34D399' : gpsStatus === 'requesting' ? '#FBBF24' : '#EF4444'}
              />
              <Text
                className={`ml-1.5 text-xs font-semibold ${
                  gpsStatus === 'tracking'
                    ? 'text-green-400'
                    : gpsStatus === 'requesting'
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}
              >
                {gpsStatus === 'tracking' ? 'GPS Active' : gpsStatus === 'requesting' ? 'Connecting...' : 'No GPS'}
              </Text>
            </View>
          </View>

          <View className="px-5">
            <View className="rounded-3xl overflow-hidden border border-pacer-border/60 bg-pacer-surface">
              {currentPosition ? (
                <MapView
                  ref={mapRef}
                  style={{ height: 220, width: SCREEN_WIDTH - 40 }}
                  region={{
                    latitude: currentPosition.latitude,
                    longitude: currentPosition.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  showsUserLocation={false}
                  followsUserLocation={false}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  {routeCoordinates.length > 1 && (
                    <Polyline
                      coordinates={routeCoordinates}
                      strokeColor="#FF6B35"
                      strokeWidth={4}
                    />
                  )}
                  <Marker
                    coordinate={currentPosition}
                    anchor={{ x: 0.5, y: 0.5 }}
                  >
                    <View className="w-4 h-4 rounded-full bg-pacer-accent border-2 border-white" />
                  </Marker>
                </MapView>
              ) : (
                <View style={{ height: 220 }} className="items-center justify-center">
                  <Animated.View style={pulseStyle}>
                    <PacerLogo size={72} animated intensity="active" />
                  </Animated.View>
                  <Text className="text-pacer-muted mt-3">
                    {gpsStatus === 'requesting' ? 'Locking GPS signal...' : 'Waiting for GPS'}
                  </Text>
                </View>
              )}

              <View className="absolute top-3 left-3 right-3 flex-row items-center justify-between">
                <View className="bg-black/60 px-3 py-1.5 rounded-full">
                  <Text className="text-pacer-white text-xs font-semibold uppercase">Run</Text>
                </View>
                <View className="bg-black/60 px-3 py-1.5 rounded-full">
                  <Text className="text-pacer-white text-xs font-semibold">
                    {pacerNames}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="px-5 mt-4">
            <View className="bg-pacer-surface rounded-3xl border border-pacer-border/60 p-5">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-pacer-muted text-xs uppercase tracking-wide">Current distance</Text>
                  <Text className="text-pacer-white text-5xl font-bold mt-1">
                    {stats.distance.toFixed(2)}
                  </Text>
                  <Text className="text-pacer-muted text-sm">miles</Text>
                </View>
                <View className="items-end">
                  <Text className="text-pacer-muted text-xs uppercase tracking-wide">Vibe</Text>
                  <Text className="text-pacer-accent text-base font-semibold mt-1">
                    {vibeConfig?.emoji} {vibeConfig?.label}
                  </Text>
                  <Text className="text-pacer-muted text-xs mt-1">
                    {gpsStatus === 'tracking'
                      ? 'Tracking live'
                      : gpsStatus === 'requesting'
                      ? 'Finding GPS...'
                      : 'Time-only mode'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between border-t border-pacer-border/40 pt-4">
                <View>
                  <Text className="text-pacer-muted text-xs uppercase">Time</Text>
                  <Text className="text-pacer-white text-lg font-mono mt-1">
                    {formatDuration(Math.round(stats.elapsedTime))}
                  </Text>
                </View>
                <View>
                  <Text className="text-pacer-muted text-xs uppercase">Pace</Text>
                  <Text className="text-pacer-white text-lg font-mono mt-1">
                    {formatPace(stats.currentPace)}/mi
                  </Text>
                </View>
                <View>
                  <Text className="text-pacer-muted text-xs uppercase">Avg pace</Text>
                  <Text className="text-pacer-white text-lg font-mono mt-1">
                    {formatPace(stats.rollingPace)}/mi
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="px-5 mt-4 flex-row gap-4">
            <View className="flex-1 bg-pacer-surface rounded-3xl border border-pacer-border/60 p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-pacer-white font-semibold">Heart rate</Text>
                <HeartPulse size={16} color="#FF6B35" />
              </View>
              {heartRateConnected ? (
                <>
                  <Text className="text-pacer-white text-3xl font-bold mt-3">
                    {heartRate ?? '--'}
                    <Text className="text-pacer-muted text-base"> bpm</Text>
                  </Text>
                  <Text className="text-green-400 text-xs mt-1">Apple Health • Live</Text>
                </>
              ) : (
                <>
                  <Text className="text-pacer-muted text-sm mt-3">
                    Connect Apple Health or Whoop to show live heart rate.
                  </Text>
                  <Pressable
                    onPress={() => setHeartRateConnected(true)}
                    className="mt-3 bg-pacer-accent/20 border border-pacer-accent/40 rounded-full px-4 py-2"
                  >
                    <Text className="text-pacer-accent text-xs font-semibold">Connect Apple Health</Text>
                  </Pressable>
                </>
              )}
            </View>

            <View className="flex-1 bg-pacer-surface rounded-3xl border border-pacer-border/60 p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-pacer-white font-semibold">Spotify</Text>
                <Pressable
                  onPress={() => setCurrentTrackIndex((prev) => (prev + 1) % spotifyTracks.length)}
                  className="w-8 h-8 rounded-full items-center justify-center bg-pacer-accent/20 border border-pacer-accent/40"
                >
                  <SkipForward size={16} color="#FF6B35" />
                </Pressable>
              </View>
              <View className="flex-row items-center mt-4">
                <Image
                  source={{ uri: currentTrack.artwork }}
                  style={{ width: 44, height: 44, borderRadius: 10 }}
                />
                <View className="ml-3 flex-1">
                  <Text className="text-pacer-white text-sm font-semibold" numberOfLines={1}>
                    {currentTrack.title}
                  </Text>
                  <Text className="text-pacer-muted text-xs mt-1" numberOfLines={1}>
                    {currentTrack.artist}
                  </Text>
                </View>
              </View>
              <Text className="text-pacer-muted text-xs mt-3">
                Tap next to skip tracks.
              </Text>
            </View>
          </View>

          {/* Hype Events Counter */}
          {hypeEventCount > 0 && (
            <View className="mt-4 px-5 flex-row items-center">
              <Volume2 size={16} color="#FF6B35" />
              <Text className="text-pacer-accent ml-2">
                {hypeEventCount} hype moment{hypeEventCount > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* End Run Button */}
        <View className="px-6 pb-4 mt-4">
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
