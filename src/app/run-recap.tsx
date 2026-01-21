import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Zap, Music, Heart, Share2, Check } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { PacerLogo } from '@/components/PacerLogo';
import { useActiveRunStore } from '@/lib/run-store';
import { useAppSettingsStore } from '@/lib/stores';
import * as Haptics from 'expo-haptics';

const VIBE_LABELS: Record<string, string> = {
  cheerful: 'Cheerful',
  fired_up: 'Fired Up',
  angry: 'Angry',
  harsh_coach: 'Harsh Coach',
  calm: 'Calm',
};

export default function RunRecapScreen() {
  const router = useRouter();
  const session = useActiveRunStore((s) => s.session);
  const showStravaPostPreview = useAppSettingsStore((s) => s.showStravaPostPreview);
  const resetRun = useActiveRunStore((s) => s.resetRun);

  const hypeEventCount = session?.hypeEvents.length || 0;
  const recapTracks = session?.recapTracks || [];
  const vibeName = session?.vibe ? VIBE_LABELS[session.vibe] : 'Mixed';
  const pacerNames = session?.pacerNames?.join(' + ') || 'Your Pacers';

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '--:--';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const handlePostToStrava = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (showStravaPostPreview) {
      router.push('/strava-post');
    } else {
      // Would post directly, for now just go home
      handleDone();
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
              className="items-center pt-8 pb-6"
            >
              <PacerLogo size={60} />
              <Text className="text-3xl font-bold text-pacer-white mt-6 text-center">
                You didn't run alone.
              </Text>
              <Text className="text-pacer-muted mt-2">
                Paced by {pacerNames}
              </Text>
            </Animated.View>

            {/* Stats Cards */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(400)}
              className="px-6 mb-6"
            >
              <View className="flex-row gap-x-3">
                {/* Hype Moments */}
                <View className="flex-1 bg-pacer-surface rounded-2xl p-5">
                  <View className="w-10 h-10 rounded-full bg-pacer-accent/20 items-center justify-center mb-3">
                    <Zap size={20} color="#FF6B35" />
                  </View>
                  <Text className="text-3xl font-bold text-pacer-white">
                    {hypeEventCount}
                  </Text>
                  <Text className="text-pacer-muted text-sm mt-1">
                    Hype moments
                  </Text>
                </View>

                {/* Vibe */}
                <View className="flex-1 bg-pacer-surface rounded-2xl p-5">
                  <View className="w-10 h-10 rounded-full bg-pacer-accent/20 items-center justify-center mb-3">
                    <Heart size={20} color="#FF6B35" />
                  </View>
                  <Text className="text-xl font-bold text-pacer-white">
                    {vibeName}
                  </Text>
                  <Text className="text-pacer-muted text-sm mt-1">
                    Vibe used
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Run Stats */}
            {session && (
              <Animated.View
                entering={FadeInDown.delay(300).duration(400)}
                className="px-6 mb-6"
              >
                <View className="bg-pacer-surface rounded-2xl p-5">
                  <View className="flex-row justify-around">
                    <View className="items-center">
                      <Text className="text-pacer-muted text-sm">Distance</Text>
                      <Text className="text-xl font-bold text-pacer-white mt-1">
                        {session.totalDistance?.toFixed(2) || '--'} mi
                      </Text>
                    </View>
                    <View className="w-px h-full bg-pacer-border" />
                    <View className="items-center">
                      <Text className="text-pacer-muted text-sm">Duration</Text>
                      <Text className="text-xl font-bold text-pacer-white mt-1">
                        {formatDuration(session.totalDuration)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Top Songs */}
            {recapTracks.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(400).duration(400)}
                className="px-6 mb-6"
              >
                <View className="flex-row items-center mb-4">
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
                className="px-6 mb-6"
              >
                <View className="flex-row items-center mb-4">
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
                            {event.voiceType === 'ai' ? 'AI Voice' : 'Real Memo'} • {event.triggerType.replace('_', ' ')}
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
            <Button
              onPress={handlePostToStrava}
              variant="primary"
              size="lg"
              fullWidth
              icon={<Share2 size={18} color="#FFF" />}
            >
              Post PACER Recap to Strava
            </Button>
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
