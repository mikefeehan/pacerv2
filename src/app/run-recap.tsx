import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import MapView, { Polyline } from 'react-native-maps';
import { Zap, Music, Share2, Check, MapPin, Clock, Route, Flame, Trophy } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { PacerLogo } from '@/components/PacerLogo';
import { useActiveRunStore } from '@/lib/run-store';
import { useAppSettingsStore } from '@/lib/stores';
import {
  getBoundingBox,
  generateGPX,
  formatDuration,
  formatPace,
  formatDistance,
} from '@/lib/gps-tracking';
import { uploadGPXToStrava, isStravaConnected } from '@/lib/strava-api';
import * as Haptics from 'expo-haptics';

const VIBE_LABELS: Record<string, string> = {
  cheerful: 'Cheerful',
  fired_up: 'Fired Up',
  angry: 'Angry',
  harsh_coach: 'Harsh Coach',
  calm: 'Calm',
};

// Pacer motivational post-run messages based on vibe
const PACER_POST_RUN_MESSAGES: Record<string, string[]> = {
  cheerful: [
    "You showed up today, and that's what matters!",
    "Every step you took was a victory.",
    "Proud of you for getting out there!",
    "You're building something amazing, one run at a time.",
  ],
  fired_up: [
    "THAT'S how it's done! You crushed it!",
    "No excuses, just results. Beast mode!",
    "You left it all out there. Respect!",
    "Champions are made on days like this!",
  ],
  angry: [
    "You showed up when others quit. That's power.",
    "Pain is temporary. This accomplishment is forever.",
    "You didn't break. They will.",
    "That's the fire. Keep burning.",
  ],
  harsh_coach: [
    "You did what needed to be done. Good.",
    "The work speaks for itself.",
    "No shortcuts. No excuses. That's the way.",
    "You earned this rest. Tomorrow, we go again.",
  ],
  calm: [
    "You found your rhythm and stayed true to it.",
    "The journey matters as much as the finish.",
    "Breathe in this accomplishment. You've earned peace.",
    "Steady progress leads to lasting results.",
  ],
};

function getPacerMessage(vibe: string): string {
  const messages = PACER_POST_RUN_MESSAGES[vibe] || PACER_POST_RUN_MESSAGES.cheerful;
  return messages[Math.floor(Math.random() * messages.length)];
}

export default function RunRecapScreen() {
  const router = useRouter();
  const session = useActiveRunStore((s) => s.session);
  const gpsPoints = useActiveRunStore((s) => s.gpsPoints);
  const stats = useActiveRunStore((s) => s.stats);
  const showStravaPostPreview = useAppSettingsStore((s) => s.showStravaPostPreview);
  const resetRun = useActiveRunStore((s) => s.resetRun);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hypeEventCount = session?.hypeEvents.length || 0;
  const recapTracks = session?.recapTracks || [];
  const vibeName = session?.vibe ? VIBE_LABELS[session.vibe] : 'Mixed';
  const pacerNames = session?.pacerNames?.join(' + ') || 'Your Pacers';

  // Get pacer motivational message
  const pacerMessage = useMemo(() => {
    return getPacerMessage(session?.vibe || 'cheerful');
  }, [session?.vibe]);

  // Calculate map bounds
  const mapBounds = useMemo(() => {
    if (gpsPoints.length < 2) return null;
    return getBoundingBox(gpsPoints);
  }, [gpsPoints]);

  // Format GPS points for polyline
  const routeCoordinates = useMemo(() => {
    return gpsPoints.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
    }));
  }, [gpsPoints]);

  // Calculate calories (rough estimate: ~100 cal per mile for average runner)
  const estimatedCalories = Math.round((stats.distance || 0) * 100);

  const generateStravaDescription = () => {
    let desc = `Run powered by PACER — paced by ${pacerNames}.\n`;
    desc += `Vibe: ${vibeName}\n\n`;
    desc += `"${pacerMessage}"\n`;

    if (recapTracks.length > 0) {
      desc += `\nSongs that carried me:\n`;
      recapTracks.forEach((track) => {
        desc += `• ${track.trackName} — ${track.artistName}\n`;
      });
    }

    desc += `\n🏃‍♂️ pacer.app`;
    return desc;
  };

  const handleUploadToStrava = async () => {
    setIsUploading(true);
    setUploadError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check if connected to Strava
    const connected = await isStravaConnected();
    if (!connected) {
      setUploadError('Please connect your Strava account first.');
      setIsUploading(false);
      setUploadStatus('error');
      return;
    }

    // Generate GPX file
    const gpxContent = generateGPX(
      gpsPoints,
      `PACER Run with ${pacerNames}`,
      generateStravaDescription()
    );

    if (!gpxContent) {
      setUploadError('No GPS data to upload.');
      setIsUploading(false);
      setUploadStatus('error');
      return;
    }

    // Upload to Strava
    const result = await uploadGPXToStrava(
      gpxContent,
      `PACER Run with ${pacerNames}`,
      generateStravaDescription(),
      'run'
    );

    setIsUploading(false);

    if (result.success) {
      setUploadStatus('success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setUploadStatus('error');
      setUploadError(result.error || 'Upload failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePostToStrava = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (showStravaPostPreview) {
      router.push('/strava-post');
    } else {
      handleUploadToStrava();
    }
  };

  const handleDone = () => {
    resetRun();
    router.replace('/home');
  };

  return (
    <View className="flex-1 bg-pacer-bg">
      <LinearGradient
        colors={['#1A1A1F', '#0A0A0B', '#0A0A0B']}
        style={{ flex: 1 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Header */}
            <Animated.View
              entering={FadeIn.duration(500)}
              className="items-center pt-6 pb-4"
            >
              <PacerLogo size={50} />
              <Text className="text-3xl font-bold text-pacer-white mt-4 text-center">
                You didn't run alone.
              </Text>
              <Text className="text-pacer-muted mt-2">
                Paced by {pacerNames}
              </Text>
            </Animated.View>

            {/* Pacer Motivational Message */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              className="px-6 mb-5"
            >
              <View className="bg-pacer-accent/10 border border-pacer-accent/30 rounded-2xl p-5">
                <View className="flex-row items-center mb-3">
                  <Trophy size={18} color="#FF6B35" />
                  <Text className="text-pacer-accent font-semibold ml-2">
                    {pacerNames} says:
                  </Text>
                </View>
                <Text className="text-pacer-white text-lg leading-7 italic">
                  "{pacerMessage}"
                </Text>
              </View>
            </Animated.View>

            {/* Map View */}
            {mapBounds && routeCoordinates.length > 1 && (
              <Animated.View
                entering={FadeInDown.delay(200).duration(400)}
                className="px-6 mb-5"
              >
                <View className="flex-row items-center mb-3">
                  <MapPin size={18} color="#FF6B35" />
                  <Text className="text-lg font-semibold text-pacer-white ml-2">
                    Your Route
                  </Text>
                </View>
                <View className="rounded-2xl overflow-hidden h-48">
                  <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: mapBounds.centerLat,
                      longitude: mapBounds.centerLon,
                      latitudeDelta: Math.max(0.01, (mapBounds.maxLat - mapBounds.minLat) * 1.3),
                      longitudeDelta: Math.max(0.01, (mapBounds.maxLon - mapBounds.minLon) * 1.3),
                    }}
                    mapType="standard"
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Polyline
                      coordinates={routeCoordinates}
                      strokeColor="#FF6B35"
                      strokeWidth={4}
                    />
                  </MapView>
                </View>
              </Animated.View>
            )}

            {/* Main Stats */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              className="px-6 mb-5"
            >
              <View className="bg-pacer-surface rounded-2xl p-5">
                <View className="flex-row">
                  {/* Distance */}
                  <View className="flex-1 items-center border-r border-pacer-border">
                    <Route size={20} color="#FF6B35" />
                    <Text className="text-3xl font-bold text-pacer-white mt-2">
                      {formatDistance(stats.distance || session?.totalDistance || 0)}
                    </Text>
                    <Text className="text-pacer-muted text-sm mt-1">miles</Text>
                  </View>

                  {/* Duration */}
                  <View className="flex-1 items-center border-r border-pacer-border">
                    <Clock size={20} color="#FF6B35" />
                    <Text className="text-3xl font-bold text-pacer-white mt-2">
                      {formatDuration(stats.elapsedTime || (session?.totalDuration || 0) * 60)}
                    </Text>
                    <Text className="text-pacer-muted text-sm mt-1">duration</Text>
                  </View>

                  {/* Pace */}
                  <View className="flex-1 items-center">
                    <Flame size={20} color="#FF6B35" />
                    <Text className="text-3xl font-bold text-pacer-white mt-2">
                      {formatPace(stats.rollingPace || stats.currentPace || 0)}
                    </Text>
                    <Text className="text-pacer-muted text-sm mt-1">/mi</Text>
                  </View>
                </View>

                {/* Secondary Stats */}
                <View className="flex-row mt-5 pt-4 border-t border-pacer-border">
                  <View className="flex-1 items-center">
                    <Text className="text-pacer-muted text-sm">Est. Calories</Text>
                    <Text className="text-pacer-white font-bold text-lg mt-1">
                      {estimatedCalories}
                    </Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-pacer-muted text-sm">Hype Moments</Text>
                    <Text className="text-pacer-accent font-bold text-lg mt-1">
                      {hypeEventCount}
                    </Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-pacer-muted text-sm">Vibe</Text>
                    <Text className="text-pacer-white font-bold text-lg mt-1">
                      {vibeName}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Top Songs */}
            {recapTracks.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(400).duration(400)}
                className="px-6 mb-5"
              >
                <View className="flex-row items-center mb-3">
                  <Music size={18} color="#FF6B35" />
                  <Text className="text-lg font-semibold text-pacer-white ml-2">
                    Songs that carried you
                  </Text>
                </View>

                <View className="bg-pacer-surface rounded-2xl overflow-hidden">
                  {recapTracks.map((track, index) => (
                    <View
                      key={track.trackId}
                      className={`flex-row items-center p-4 ${
                        index < recapTracks.length - 1 ? 'border-b border-pacer-border' : ''
                      }`}
                    >
                      <View className="w-8 h-8 rounded-lg bg-pacer-accent/20 items-center justify-center mr-3">
                        <Text className="text-pacer-accent font-bold">
                          {index + 1}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-pacer-white font-medium">
                          {track.trackName}
                        </Text>
                        <Text className="text-pacer-muted text-sm">
                          {track.artistName}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Hype Events Timeline */}
            {session && session.hypeEvents.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(500).duration(400)}
                className="px-6 mb-5"
              >
                <View className="flex-row items-center mb-3">
                  <Zap size={18} color="#FF6B35" />
                  <Text className="text-lg font-semibold text-pacer-white ml-2">
                    Hype Timeline
                  </Text>
                </View>

                <View className="bg-pacer-surface rounded-2xl p-4">
                  {session.hypeEvents.slice(0, 4).map((event, index) => (
                    <View
                      key={event.id}
                      className={`flex-row items-start ${
                        index < Math.min(session.hypeEvents.length - 1, 3)
                          ? 'pb-4 mb-4 border-b border-pacer-border'
                          : ''
                      }`}
                    >
                      <View className="w-6 h-6 rounded-full bg-pacer-accent items-center justify-center mr-3 mt-0.5">
                        <Text className="text-white text-xs font-bold">
                          {index + 1}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-pacer-white font-medium">
                          "{event.generatedText}"
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-pacer-muted text-xs">
                            {event.pacerName} • {event.voiceType === 'ai' ? 'AI Voice' : 'Real Memo'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Bottom CTAs */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(400)}
            className="px-6 pb-4 pt-2 border-t border-pacer-border"
          >
            {uploadStatus === 'success' ? (
              <View className="flex-row items-center justify-center py-4 bg-green-500/20 rounded-xl mb-3">
                <Check size={20} color="#34D399" />
                <Text className="text-green-400 font-semibold ml-2">
                  Uploaded to Strava!
                </Text>
              </View>
            ) : uploadStatus === 'error' ? (
              <View className="mb-3">
                <View className="flex-row items-center justify-center py-3 bg-red-500/20 rounded-xl mb-2">
                  <Text className="text-red-400 text-sm text-center px-4">
                    {uploadError || 'Upload failed'}
                  </Text>
                </View>
                <Button
                  onPress={handleUploadToStrava}
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isUploading}
                  icon={<Share2 size={18} color="#FFF" />}
                >
                  Try Again
                </Button>
              </View>
            ) : (
              <Button
                onPress={gpsPoints.length > 1 ? handleUploadToStrava : handlePostToStrava}
                variant="primary"
                size="lg"
                fullWidth
                loading={isUploading}
                icon={isUploading ? undefined : <Share2 size={18} color="#FFF" />}
              >
                {isUploading ? 'Uploading...' : gpsPoints.length > 1 ? 'Upload to Strava' : 'Post PACER Recap to Strava'}
              </Button>
            )}
            <Pressable
              onPress={handleDone}
              className="py-4 active:opacity-70"
            >
              <Text className="text-pacer-muted text-center font-medium">
                Done
              </Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
