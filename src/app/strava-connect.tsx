import React from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Activity, Lock, CheckCircle, AlertCircle } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useAuthStore, usePacerStore } from '@/lib/stores';
import { MOCK_PACERS } from '@/lib/mock-data';
import {
  startStravaOAuth,
  isStravaConfigured,
  isStravaConnected,
  getRedirectUri,
} from '@/lib/strava-api';
import * as Haptics from 'expo-haptics';

export default function StravaConnectScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setPacers = usePacerStore((s) => s.setPacers);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Check if already connected on mount
  React.useEffect(() => {
    // Log redirect URI for debugging
    console.log('=== STRAVA REDIRECT URI ===');
    console.log(getRedirectUri());
    console.log('===========================');
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    const connected = await isStravaConnected();
    if (connected) {
      setIsConnected(true);
      // Auto-navigate after a brief moment
      setTimeout(() => {
        completeConnection('existing_user');
      }, 500);
    }
  };

  const completeConnection = (athleteId: string) => {
    // Create user with Strava connected
    setUser({
      id: 'user_1',
      name: 'Runner',
      stravaUserId: athleteId,
      stravaConnected: true,
      spotifyConnected: false,
      onboardingComplete: false,
    });

    // Load mock pacers
    setPacers(MOCK_PACERS);

    // Navigate to onboarding
    router.replace('/onboarding');
  };

  const handleConnectStrava = async () => {
    setIsConnecting(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check if Strava is configured
    if (!isStravaConfigured()) {
      setError('Connect Strava unavailable (missing API keys). Add EXPO_PUBLIC_STRAVA_CLIENT_ID and EXPO_PUBLIC_STRAVA_CLIENT_SECRET in the ENV tab.');
      setIsConnecting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      // Start real OAuth flow
      const tokens = await startStravaOAuth();

      if (tokens) {
        setIsConnected(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Wait a moment to show success state
        await new Promise((resolve) => setTimeout(resolve, 800));

        completeConnection(tokens.athleteId);
      } else {
        // User cancelled or error occurred
        setError('Connection was cancelled. Please try again.');
        setIsConnecting(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (e) {
      console.error('Strava OAuth error:', e);
      setError('Failed to connect to Strava. Please try again.');
      setIsConnecting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
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
                Connect your Strava account to upload runs{'\n'}
                with your PACER recap and route map.
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
                      Upload your runs with GPS data
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <CheckCircle size={20} color="#34D399" />
                    <Text className="text-pacer-white ml-3 flex-1">
                      Add PACER recap to activity description
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <CheckCircle size={20} color="#34D399" />
                    <Text className="text-pacer-white ml-3 flex-1">
                      Show your route map with splits
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

            {/* Error Message */}
            {error && (
              <Animated.View
                entering={FadeIn.duration(300)}
                className="mt-4"
              >
                <View className="flex-row items-center bg-red-500/20 rounded-xl p-4">
                  <AlertCircle size={20} color="#EF4444" />
                  <Text className="text-red-400 ml-3 flex-1 text-sm">
                    {error}
                  </Text>
                </View>
              </Animated.View>
            )}

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
                  {isConnecting ? 'Connecting...' : 'Connect Strava'}
                </Button>
              )}

              <Text className="text-pacer-muted text-xs text-center mt-4 px-8">
                By connecting, you agree to share your activity data with Strava.
              </Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
