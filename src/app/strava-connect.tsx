import React from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Activity, Lock, CheckCircle } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useAuthStore, usePacerStore } from '@/lib/stores';
import { MOCK_PACERS } from '@/lib/mock-data';
import * as Haptics from 'expo-haptics';

export default function StravaConnectScreen() {
  const router = useRouter();
  const updateUser = useAuthStore((s) => s.updateUser);
  const setUser = useAuthStore((s) => s.setUser);
  const setPacers = usePacerStore((s) => s.setPacers);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);

  const handleConnectStrava = async () => {
    setIsConnecting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate Strava OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock successful connection
    setIsConnected(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Create mock user with Strava connected
    setUser({
      id: 'user_1',
      name: 'Runner',
      stravaUserId: 'strava_12345',
      stravaConnected: true,
      spotifyConnected: false,
      onboardingComplete: false,
    });

    // Load mock pacers
    setPacers(MOCK_PACERS);

    // Wait a moment to show success state
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Navigate to onboarding
    router.replace('/onboarding');
  };

  return (
    <View className="flex-1 bg-pacer-bg">
      <LinearGradient
        colors={['#0A0A0B', '#1A1A1F', '#0A0A0B']}
        style={{ flex: 1 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6 py-8">
            {/* Top Section */}
            <Animated.View
              entering={FadeIn.delay(200).duration(500)}
              className="items-center pt-16"
            >
              {/* Strava-like icon */}
              <View className="w-24 h-24 rounded-3xl bg-[#FC4C02] items-center justify-center mb-6">
                <Activity size={48} color="#FFF" strokeWidth={2.5} />
              </View>

              <Text className="text-2xl font-bold text-pacer-white text-center">
                Connect Strava
              </Text>
              <Text className="text-pacer-muted text-center mt-3 leading-6 px-4">
                A Strava account is required to use PACER.{'\n'}
                We'll read your run data to detect when you need a boost.
              </Text>
            </Animated.View>

            {/* Permissions List */}
            <Animated.View
              entering={FadeInUp.delay(400).duration(500)}
              className="mt-12"
            >
              <View className="bg-pacer-surface rounded-2xl p-5">
                <Text className="text-sm font-medium text-pacer-muted mb-4 uppercase tracking-wide">
                  What we'll access
                </Text>

                <View className="gap-y-4">
                  <View className="flex-row items-center">
                    <CheckCircle size={20} color="#34D399" />
                    <Text className="text-pacer-white ml-3 flex-1">
                      Read your running activities
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <CheckCircle size={20} color="#34D399" />
                    <Text className="text-pacer-white ml-3 flex-1">
                      Live pace and distance during runs
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <CheckCircle size={20} color="#34D399" />
                    <Text className="text-pacer-white ml-3 flex-1">
                      Update activity descriptions (with your approval)
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mt-5 pt-4 border-t border-pacer-border">
                  <Lock size={16} color="#6B7280" />
                  <Text className="text-pacer-muted text-sm ml-2">
                    We never post without your permission
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Bottom CTA */}
            <Animated.View entering={FadeInUp.delay(600).duration(500)}>
              {isConnected ? (
                <View className="items-center py-4">
                  <View className="flex-row items-center">
                    <CheckCircle size={24} color="#34D399" />
                    <Text className="text-pacer-success text-lg font-semibold ml-2">
                      Connected!
                    </Text>
                  </View>
                </View>
              ) : (
                <Button
                  onPress={handleConnectStrava}
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Authorize Strava'}
                </Button>
              )}

              <Text className="text-pacer-muted text-xs text-center mt-4 px-8">
                By connecting, you agree to share your Strava activity data with PACER.
              </Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
